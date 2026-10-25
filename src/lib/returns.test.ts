import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, db } from '@/services/mock/db';
import { mockApi } from '@/services/mock';
import type { Order } from '@/types';
import { RETURN_WINDOW_DAYS, returnWindow } from './returns';

const DAY = 86_400_000;

function delivered(daysAgo: number, now = Date.now()): Pick<Order, 'status' | 'shipment'> {
  return {
    status: 'delivered',
    shipment: {
      carrier: 'ParcelPoint',
      tracking_number: 'PP1',
      eta: new Date(now).toISOString(),
      events: [
        {
          status: 'delivered',
          label: 'Delivered',
          location: '',
          at: new Date(now - daysAgo * DAY).toISOString(),
        },
      ],
    },
  };
}

describe('7-day return window', () => {
  it('is 7 days', () => {
    expect(RETURN_WINDOW_DAYS).toBe(7);
  });

  it('is open up to 7 days after delivery and closed after', () => {
    const now = Date.now();
    expect(returnWindow(delivered(0, now), new Date(now)).open).toBe(true);
    expect(returnWindow(delivered(6.9, now), new Date(now)).open).toBe(true);
    expect(returnWindow(delivered(7.1, now), new Date(now)).open).toBe(false);
    expect(returnWindow(delivered(2, now), new Date(now)).deadline?.getTime()).toBe(now + 5 * DAY);
  });

  it('is not open before delivery', () => {
    expect(returnWindow({ status: 'shipped', shipment: null })).toEqual({
      open: false,
      deadline: null,
    });
  });
});

describe('mock backend enforces the window', () => {
  beforeEach(async () => {
    localStorage.clear();
    await mockApi.auth.signIn({ email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD });
  });

  it('accepts a return on the recently delivered demo order', async () => {
    const order = (await mockApi.orders.listOrders()).find((o) => o.status === 'delivered');
    if (!order) throw new Error('demo data needs a delivered order');
    const req = await mockApi.orders.requestReturn({
      orderId: order.id,
      itemIds: [order.items[0]?.id ?? ''],
      type: 'refund',
      reason: 'too_small',
      note: '',
    });
    expect(req.status).toBe('requested');
  });

  it('rejects a return once 7 days have passed since delivery', async () => {
    const order = (await mockApi.orders.listOrders()).find((o) => o.status === 'delivered');
    if (!order?.shipment) throw new Error('demo data needs a delivered order');
    const old = new Date(Date.now() - 8 * DAY).toISOString();
    db.setOrders(
      db.orders().map((o) =>
        o.id === order.id
          ? {
              ...o,
              shipment: {
                ...order.shipment!,
                events: order.shipment!.events.map((e) =>
                  e.status === 'delivered' ? { ...e, at: old } : e,
                ),
              },
            }
          : o,
      ),
    );
    await expect(
      mockApi.orders.requestReturn({
        orderId: order.id,
        itemIds: [order.items[0]?.id ?? ''],
        type: 'refund',
        reason: 'too_small',
        note: '',
      }),
    ).rejects.toThrow('The 7-day return window for this order has closed.');
  });
});
