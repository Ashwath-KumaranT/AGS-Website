/**
 * The "server" half of the mock backend. Everything in here represents logic that runs
 * server-side in production (Supabase RPC / Edge Functions): it never trusts client
 * prices, re-validates inventory and coupons, and only marks orders paid when a signed
 * provider webhook arrives.
 */
import { checkDeliveryForPostalCode, estimateWindow } from '@/lib/delivery';
import { checkCoupon, computeTotals, getDeliveryOption } from '@/lib/pricing';
import { addressSchema, emailSchema } from '@/lib/validation';
import { ApiError } from '@/services/types';
import type {
  AppNotification,
  Coupon,
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItem,
  OrderStatus,
  PaymentIntent,
  Quote,
  QuoteInput,
  QuoteIssue,
  QuoteLine,
  TrackingEvent,
} from '@/types';
import { getCatalog } from './catalog';
import { db, uid, weakHash } from './db';
import { requireUser } from './session';

const WEBHOOK_SECRET = 'whsec_mock_local_only';

export function signWebhook(payload: string): string {
  return weakHash(`${WEBHOOK_SECRET}.${payload}`);
}

/* ------------------------------ quoting ------------------------------ */

/**
 * A coupon's usage count only rises once an order is paid, so orders still awaiting payment
 * hold a use that nothing has counted yet. Counting them here keeps several unpaid orders
 * from taking a limited coupon past its limit.
 */
export function withPendingUses(coupon: Coupon): Coupon {
  const pending = db
    .orders()
    .filter((o) => o.status === 'pending_payment' && o.coupon_code === coupon.code).length;
  return pending === 0 ? coupon : { ...coupon, times_used: coupon.times_used + pending };
}

export function quoteOrder(input: QuoteInput, now = new Date()): Quote {
  const catalog = getCatalog();
  const variantMap = new Map(
    catalog.flatMap((p) => p.variants.map((v) => [v.id, { p, v }] as const)),
  );
  const issues: QuoteIssue[] = [];
  const lines: QuoteLine[] = [];

  for (const l of input.lines) {
    const hit = variantMap.get(l.variantId);
    if (!hit) {
      issues.push({
        code: 'variant_removed',
        variantId: l.variantId,
        message: 'An item is no longer available.',
      });
      continue;
    }
    const { p, v } = hit;
    if (v.inventory_count <= 0) {
      issues.push({
        code: 'out_of_stock',
        variantId: v.id,
        message: `${p.title} (${v.color}, ${v.size}) is sold out.`,
      });
      continue;
    }
    if (l.quantity > v.inventory_count) {
      issues.push({
        code: 'insufficient_stock',
        variantId: v.id,
        message: `Only ${v.inventory_count} left of ${p.title} (${v.color}, ${v.size}).`,
      });
    }
    lines.push({
      variantId: v.id,
      productId: p.id,
      quantity: Math.min(l.quantity, v.inventory_count),
      unit_price: v.price,
      compare_at_price: p.compare_at_price,
    });
  }

  const delivery = getDeliveryOption(input.deliveryId);
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  let coupon = null;
  if (input.couponCode) {
    const found = db
      .coupons()
      .find((c) => c.code.toLowerCase() === input.couponCode?.trim().toLowerCase());
    const check = checkCoupon(found && withPendingUses(found), subtotal, now);
    if (check.valid) coupon = check.coupon;
    else issues.push({ code: 'coupon_invalid', message: check.reason });
  }

  const totals = computeTotals({
    lines: lines.map((l) => ({
      unitPrice: l.unit_price,
      compareAtPrice: l.compare_at_price,
      quantity: l.quantity,
    })),
    coupon,
    delivery,
  });
  return { lines, totals, coupon, issues };
}

/* ------------------------------ orders ------------------------------ */

function nextOrderNumber(): string {
  const n = db.orderCounter() + 1;
  db.setOrderCounter(n);
  return `ASG-${n}`;
}

function adjustInventory(variantId: string, delta: number): void {
  const inv = db.inventory();
  inv[variantId] = (inv[variantId] ?? 0) + delta;
  db.setInventory(inv);
}

export function pushNotification(
  userId: string,
  n: Pick<AppNotification, 'title' | 'body' | 'type'>,
): void {
  const item: AppNotification = {
    id: uid('ntf'),
    user_id: userId,
    read: false,
    created_at: new Date().toISOString(),
    ...n,
  };
  db.setNotifications([item, ...db.notifications()]);
}

export function createOrderServer(input: CreateOrderInput): CreateOrderResult {
  const user = requireUser();

  // 1. validate untrusted input on the server
  const email = emailSchema.safeParse(input.contactEmail);
  if (!email.success) throw new ApiError('VALIDATION', 'Enter a valid contact email.');
  const addr = addressSchema.safeParse({ ...input.address, line2: input.address.line2 ?? '' });
  if (!addr.success) {
    throw new ApiError(
      'VALIDATION',
      addr.error.issues[0]?.message ?? 'The delivery address is invalid.',
    );
  }
  if (input.lines.length === 0) throw new ApiError('VALIDATION', 'Your cart is empty.');
  if (!checkDeliveryForPostalCode(input.address.postal_code).serviceable) {
    throw new ApiError('VALIDATION', "We don't deliver to this postal code yet.");
  }

  // 2. recompute everything from the catalog
  const quote = quoteOrder(input);
  const blocking = quote.issues.find((i) => i.code !== 'price_changed');
  if (blocking) {
    throw new ApiError(
      blocking.code === 'coupon_invalid' ? 'COUPON_INVALID' : 'OUT_OF_STOCK',
      blocking.message,
      quote.issues,
    );
  }
  if (input.expectedTotal !== undefined && input.expectedTotal !== quote.totals.total) {
    throw new ApiError('PRICE_CHANGED', 'Prices changed since you last reviewed your order.', {
      newTotal: quote.totals.total,
    });
  }

  // 3. build the order (pending until the provider webhook confirms payment)
  const catalog = getCatalog();
  const orderId = uid('ord');
  const items: OrderItem[] = quote.lines.map((l) => {
    const p = catalog.find((x) => x.id === l.productId);
    const v = p?.variants.find((x) => x.id === l.variantId);
    if (!p || !v) throw new ApiError('NOT_FOUND', 'Item not found');
    return {
      id: uid('oi'),
      order_id: orderId,
      product_id: p.id,
      variant_id: v.id,
      title: p.title,
      slug: p.slug,
      color: v.color,
      size: v.size,
      image_url: v.image_urls[0] ?? '',
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.unit_price * l.quantity,
      reviewed: false,
    };
  });

  // reserve stock
  items.forEach((i) => adjustInventory(i.variant_id, -i.quantity));

  const delivery = getDeliveryOption(input.deliveryId);
  const a = addr.data;
  const intentId = uid('pi');
  const order: Order = {
    id: orderId,
    number: nextOrderNumber(),
    user_id: user.id,
    status: 'pending_payment',
    items,
    contact_email: email.data,
    shipping_address: {
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      country: a.country,
    },
    delivery_option: input.deliveryId,
    coupon_code: quote.coupon?.code ?? null,
    totals: quote.totals,
    payment: {
      id: intentId,
      status: 'requires_payment',
      amount: quote.totals.total,
      brand: null,
      last4: null,
      failure_reason: null,
    },
    shipment: null,
    estimated_delivery: estimateWindow(delivery),
    created_at: new Date().toISOString(),
  };
  db.setOrders([order, ...db.orders()]);

  const intent: PaymentIntent = {
    id: intentId,
    order_id: orderId,
    amount: quote.totals.total,
    client_secret: `${intentId}_secret_${weakHash(orderId)}`,
  };
  return { order, intent };
}

export function retryPaymentServer(orderId: string): CreateOrderResult {
  const user = requireUser();
  const order = db.orders().find((o) => o.id === orderId && o.user_id === user.id);
  if (!order) throw new ApiError('NOT_FOUND', 'Order not found.');
  if (order.status !== 'payment_failed' && order.status !== 'pending_payment') {
    throw new ApiError('VALIDATION', 'This order can no longer be paid.');
  }
  // order is still reserved if pending, released if failed → re-validate and re-reserve
  const wasReserved = order.status === 'pending_payment';
  const quote = quoteOrder({
    lines: order.items.map((i) => ({ variantId: i.variant_id, quantity: i.quantity })),
    couponCode: order.coupon_code,
    deliveryId: order.delivery_option,
  });
  // when still reserved, our own reservation shows up as missing stock; skip stock check then
  if (!wasReserved) {
    const blocking = quote.issues.find(
      (i) =>
        i.code === 'out_of_stock' ||
        i.code === 'insufficient_stock' ||
        i.code === 'variant_removed',
    );
    if (blocking) throw new ApiError('OUT_OF_STOCK', blocking.message, quote.issues);
    order.items.forEach((i) => adjustInventory(i.variant_id, -i.quantity));
  }
  const intentId = uid('pi');
  const updated: Order = {
    ...order,
    status: 'pending_payment',
    payment: { ...order.payment, id: intentId, status: 'requires_payment', failure_reason: null },
  };
  db.setOrders(db.orders().map((o) => (o.id === orderId ? updated : o)));
  return {
    order: updated,
    intent: {
      id: intentId,
      order_id: orderId,
      amount: order.totals.total,
      client_secret: `${intentId}_secret_${weakHash(orderId)}`,
    },
  };
}

/* ------------------------------ webhook ------------------------------ */

export interface WebhookEvent {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
  data: { intent_id: string; brand?: string; last4?: string; failure_reason?: string };
}

/**
 * Verifies the provider signature and applies the payment result. Idempotent per event id.
 * This is the ONLY place an order can become paid.
 */
export function handleWebhook(rawBody: string, signature: string): { received: boolean } {
  if (signWebhook(rawBody) !== signature) {
    throw new ApiError('VALIDATION', 'Invalid webhook signature');
  }
  const event = JSON.parse(rawBody) as WebhookEvent;
  const seen = db.processedEvents();
  if (seen.includes(event.id)) return { received: true };
  db.setProcessedEvents([...seen.slice(-200), event.id]);

  const order = db.orders().find((o) => o.payment.id === event.data.intent_id);
  if (!order) return { received: true };

  if (event.type === 'payment_intent.succeeded') {
    if (order.status !== 'pending_payment') return { received: true };
    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      status: 'paid',
      payment: {
        ...order.payment,
        status: 'succeeded',
        brand: event.data.brand ?? null,
        last4: event.data.last4 ?? null,
        failure_reason: null,
      },
      shipment: {
        carrier: 'ParcelPoint',
        tracking_number: `PP${Math.floor(1e9 + Math.random() * 9e9)}`,
        eta: order.estimated_delivery.to,
        events: [{ status: 'paid', label: 'Order confirmed', location: 'ASG', at: now }],
      },
    };
    db.setOrders(db.orders().map((o) => (o.id === order.id ? updated : o)));
    if (order.coupon_code) {
      db.setCoupons(
        db
          .coupons()
          .map((c) => (c.code === order.coupon_code ? { ...c, times_used: c.times_used + 1 } : c)),
      );
    }
    pushNotification(order.user_id, {
      type: 'order',
      title: `Order ${order.number} confirmed`,
      body: 'Thanks for your order — we are getting it ready to ship.',
    });
  } else if (event.type === 'payment_intent.payment_failed') {
    if (order.status !== 'pending_payment') return { received: true };
    order.items.forEach((i) => adjustInventory(i.variant_id, i.quantity)); // release reservation
    const updated: Order = {
      ...order,
      status: 'payment_failed',
      payment: {
        ...order.payment,
        status: 'failed',
        failure_reason: event.data.failure_reason ?? 'Payment failed',
      },
    };
    db.setOrders(db.orders().map((o) => (o.id === order.id ? updated : o)));
  }
  return { received: true };
}

/* ------------------------------ fulfilment ------------------------------ */

const FLOW: { status: OrderStatus; label: string; location: string }[] = [
  {
    status: 'processing',
    label: 'Packed and ready to ship',
    location: 'ASG Fulfilment Centre',
  },
  { status: 'shipped', label: 'Shipped with carrier', location: 'Regional Hub' },
  { status: 'out_for_delivery', label: 'Out for delivery', location: 'Local Depot' },
  { status: 'delivered', label: 'Delivered', location: 'Delivery address' },
];

export function advanceOrder(orderId: string): Order {
  const user = requireUser();
  const order = db.orders().find((o) => o.id === orderId && o.user_id === user.id);
  if (!order) throw new ApiError('NOT_FOUND', 'Order not found.');
  const currentIdx = FLOW.findIndex((f) => f.status === order.status);
  const next =
    order.status === 'paid' ? FLOW[0] : currentIdx >= 0 ? FLOW[currentIdx + 1] : undefined;
  if (!next || !order.shipment) return order;
  const event: TrackingEvent = { ...next, at: new Date().toISOString() };
  const updated: Order = {
    ...order,
    status: next.status,
    shipment: { ...order.shipment, events: [...order.shipment.events, event] },
  };
  db.setOrders(db.orders().map((o) => (o.id === order.id ? updated : o)));
  pushNotification(user.id, {
    type: 'order',
    title: `Order ${order.number}: ${next.label}`,
    body: 'Tap to track your parcel.',
  });
  return updated;
}

export function cancelOrderServer(orderId: string): Order {
  const user = requireUser();
  const order = db.orders().find((o) => o.id === orderId && o.user_id === user.id);
  if (!order) throw new ApiError('NOT_FOUND', 'Order not found.');
  if (!['paid', 'processing'].includes(order.status)) {
    throw new ApiError(
      'VALIDATION',
      'This order has already shipped and can no longer be cancelled.',
    );
  }
  order.items.forEach((i) => adjustInventory(i.variant_id, i.quantity));
  const updated: Order = {
    ...order,
    status: 'cancelled',
    payment: { ...order.payment, status: 'refunded' },
    shipment: order.shipment
      ? {
          ...order.shipment,
          events: [
            ...order.shipment.events,
            {
              status: 'cancelled',
              label: 'Order cancelled — refund issued',
              location: 'ASG',
              at: new Date().toISOString(),
            },
          ],
        }
      : null,
  };
  db.setOrders(db.orders().map((o) => (o.id === order.id ? updated : o)));
  pushNotification(user.id, {
    type: 'order',
    title: `Order ${order.number} cancelled`,
    body: 'Your refund is on its way.',
  });
  return updated;
}
