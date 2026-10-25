import { beforeEach, describe, expect, it } from 'vitest';
import { isApiError } from '@/services/types';
import { getCatalog } from './catalog';
import { db, DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from './db';
import { mockApi } from './index';
import { createOrderServer, handleWebhook, quoteOrder, signWebhook } from './server';

const address = {
  name: 'Demo Shopper',
  phone: '+1 415 555 0134',
  line1: '221 Market Street',
  line2: '',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94105',
  country: 'US',
};

function inStockVariant() {
  const p = getCatalog().find((x) => x.slug === 'heavyweight-crew-tee');
  const v = p?.variants.find((x) => x.inventory_count >= 2);
  if (!p || !v) throw new Error('fixture missing');
  return { p, v };
}

const card = {
  number: '4242424242424242',
  name: 'Demo',
  exp_month: 12,
  exp_year: 2099,
  cvc: '123',
};

describe('mock backend (server-side rules)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await mockApi.auth.signIn({ email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD });
  });

  it('prices quotes from the catalog, not from the client', () => {
    const { v } = inStockVariant();
    const q = quoteOrder({ lines: [{ variantId: v.id, quantity: 2 }], deliveryId: 'standard' });
    expect(q.totals.subtotal).toBe(v.price * 2);
  });

  it('reports invalid coupons and removed variants as issues', () => {
    const q = quoteOrder({
      lines: [{ variantId: 'nope', quantity: 1 }],
      couponCode: 'EARLYBIRD25',
      deliveryId: 'standard',
    });
    expect(q.issues.map((i) => i.code).sort()).toEqual(['coupon_invalid', 'variant_removed']);
  });

  it('requires a signed-in user to create an order', async () => {
    await mockApi.auth.signOut();
    const { v } = inStockVariant();
    expect(() =>
      createOrderServer({
        lines: [{ variantId: v.id, quantity: 1 }],
        deliveryId: 'standard',
        contactEmail: DEMO_USER_EMAIL,
        address,
      }),
    ).toThrowError(/session/i);
  });

  it('rejects an order when the total the shopper saw is stale', () => {
    const { v } = inStockVariant();
    try {
      createOrderServer({
        lines: [{ variantId: v.id, quantity: 1 }],
        deliveryId: 'standard',
        contactEmail: DEMO_USER_EMAIL,
        address,
        expectedTotal: 1,
      });
      expect.unreachable();
    } catch (e) {
      expect(isApiError(e) && e.code).toBe('PRICE_CHANGED');
    }
  });

  it('only marks an order paid after a valid signed webhook, and is idempotent', async () => {
    const { v } = inStockVariant();
    const before = v.inventory_count;
    const { order, intent } = await mockApi.checkout.createOrder({
      lines: [{ variantId: v.id, quantity: 1 }],
      deliveryId: 'standard',
      contactEmail: DEMO_USER_EMAIL,
      address,
    });
    expect(order.status).toBe('pending_payment');

    const body = JSON.stringify({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { intent_id: intent.id },
    });
    expect(() => handleWebhook(body, 'forged')).toThrowError(/signature/i);
    expect((await mockApi.orders.getOrder(order.id))?.status).toBe('pending_payment');

    handleWebhook(body, signWebhook(body));
    handleWebhook(body, signWebhook(body)); // replay
    const paid = await mockApi.orders.getOrder(order.id);
    expect(paid?.status).toBe('paid');
    expect(db.notifications().filter((n) => n.title.includes(order.number))).toHaveLength(1);
    expect(
      getCatalog()
        .flatMap((p) => p.variants)
        .find((x) => x.id === v.id)?.inventory_count,
    ).toBe(before - 1);
  });

  it('releases reserved stock when payment fails and allows a retry', async () => {
    const { v } = inStockVariant();
    const before = v.inventory_count;
    const { order, intent } = await mockApi.checkout.createOrder({
      lines: [{ variantId: v.id, quantity: 1 }],
      deliveryId: 'standard',
      contactEmail: DEMO_USER_EMAIL,
      address,
    });
    const declined = await mockApi.payments.confirm(intent, {
      ...card,
      number: '4000000000000002',
    });
    expect(declined.status).toBe('failed');
    expect((await mockApi.orders.getOrder(order.id))?.status).toBe('payment_failed');
    expect(
      getCatalog()
        .flatMap((p) => p.variants)
        .find((x) => x.id === v.id)?.inventory_count,
    ).toBe(before);

    const retry = await mockApi.checkout.retryPayment(order.id);
    expect((await mockApi.payments.confirm(retry.intent, card)).status).toBe('succeeded');
    expect((await mockApi.orders.getOrder(order.id))?.status).toBe('paid');
  });

  it('counts coupon uses held by unpaid orders against the usage limit', async () => {
    // USEDUP allows 5 uses; leave exactly one
    db.setCoupons(db.coupons().map((c) => (c.code === 'USEDUP' ? { ...c, times_used: 4 } : c)));
    const { v } = inStockVariant();
    const lines = [{ variantId: v.id, quantity: 1 }];
    expect(
      quoteOrder({ lines, couponCode: 'USEDUP', deliveryId: 'standard' }).coupon?.code,
    ).toBe('USEDUP');

    // an order awaiting payment is holding that last use, even though nothing is paid yet
    await mockApi.checkout.createOrder({
      lines,
      couponCode: 'USEDUP',
      deliveryId: 'standard',
      contactEmail: DEMO_USER_EMAIL,
      address,
    });
    const after = quoteOrder({ lines, couponCode: 'USEDUP', deliveryId: 'standard' });
    expect(after.coupon).toBeNull();
    expect(after.issues.map((i) => i.code)).toContain('coupon_invalid');
  });

  it('rejects returns for items outside the order, and for items already being returned', async () => {
    const delivered = (await mockApi.orders.listOrders()).find((o) => o.status === 'delivered');
    if (!delivered) throw new Error('fixture missing');
    const [first, second] = delivered.items;
    if (!first || !second) throw new Error('fixture needs two items');

    await expect(
      mockApi.orders.requestReturn({
        orderId: delivered.id,
        itemIds: ['oi_not_mine'],
        type: 'refund',
        reason: 'too_small',
        note: '',
      }),
    ).rejects.toThrowError(/not part of this order/i);

    await mockApi.orders.requestReturn({
      orderId: delivered.id,
      itemIds: [first.id],
      type: 'refund',
      reason: 'too_small',
      note: '',
    });
    await expect(
      mockApi.orders.requestReturn({
        orderId: delivered.id,
        itemIds: [first.id, second.id],
        type: 'refund',
        reason: 'too_small',
        note: '',
      }),
    ).rejects.toThrowError(/already been requested/i);
  });

  it('keeps users out of each other’s orders', async () => {
    const { v } = inStockVariant();
    const { order } = await mockApi.checkout.createOrder({
      lines: [{ variantId: v.id, quantity: 1 }],
      deliveryId: 'standard',
      contactEmail: DEMO_USER_EMAIL,
      address,
    });
    await mockApi.auth.signOut();
    await mockApi.auth.signUp({
      name: 'Other Person',
      email: 'other@example.com',
      password: 'Secret123',
    });
    expect(await mockApi.orders.getOrder(order.id)).toBeNull();
    expect(await mockApi.orders.listOrders()).toEqual([]);
  });
});
