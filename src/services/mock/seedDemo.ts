import { estimateWindow } from '@/lib/delivery';
import { computeTotals, getDeliveryOption } from '@/lib/pricing';
import type { Address, Order, OrderItem, OrderStatus, TrackingEvent } from '@/types';
import {
  db,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  load,
  save,
  weakHash,
  type StoredUser,
} from './db';
import { PRODUCTS } from './seed';

const DEMO_ID = 'user_demo';

const STATUS_ORDER: OrderStatus[] = [
  'paid',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];
const LABELS: Record<string, [string, string]> = {
  paid: ['Order confirmed', 'ASG'],
  processing: ['Packed and ready to ship', 'ASG Fulfilment Centre'],
  shipped: ['Shipped with carrier', 'Regional Hub'],
  out_for_delivery: ['Out for delivery', 'Local Depot'],
  delivered: ['Delivered', 'Delivery address'],
};

function makeOrder(
  n: number,
  daysAgo: number,
  status: OrderStatus,
  picks: { slug: string; colorIdx: number; size: string; qty: number }[],
): Order {
  const created = new Date(Date.now() - daysAgo * 86_400_000);
  const id = `ord_seed_${n}`;
  const items: OrderItem[] = picks.map((pk, i) => {
    const p = PRODUCTS.find((x) => x.slug === pk.slug);
    const v =
      p?.variants.find(
        (x) => x.color === p.variants[0 + pk.colorIdx * 5]?.color && x.size === pk.size,
      ) ?? p?.variants[0];
    if (!p || !v) throw new Error(`seed product missing: ${pk.slug}`);
    return {
      id: `${id}_${i}`,
      order_id: id,
      product_id: p.id,
      variant_id: v.id,
      title: p.title,
      slug: p.slug,
      color: v.color,
      size: v.size,
      image_url: v.image_urls[0] ?? '',
      unit_price: v.price,
      quantity: pk.qty,
      line_total: v.price * pk.qty,
      reviewed: false,
    };
  });
  const delivery = getDeliveryOption('standard');
  const totals = computeTotals({
    lines: items.map((i) => ({ unitPrice: i.unit_price, quantity: i.quantity })),
    delivery,
  });
  const idx = STATUS_ORDER.indexOf(status);
  const events: TrackingEvent[] = STATUS_ORDER.slice(0, idx + 1).map((s, i) => ({
    status: s,
    label: LABELS[s]?.[0] ?? s,
    location: LABELS[s]?.[1] ?? '',
    at: new Date(created.getTime() + i * 26 * 3_600_000).toISOString(),
  }));
  return {
    id,
    number: `ASG-${100100 + n}`,
    user_id: DEMO_ID,
    status,
    items,
    contact_email: DEMO_USER_EMAIL,
    shipping_address: {
      name: 'Demo Shopper',
      phone: '+1 415 555 0134',
      line1: '221 Market Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
    delivery_option: 'standard',
    coupon_code: null,
    totals,
    payment: {
      id: `pi_seed_${n}`,
      status: 'succeeded',
      amount: totals.total,
      brand: 'Visa',
      last4: '4242',
      failure_reason: null,
    },
    shipment: {
      carrier: 'ParcelPoint',
      tracking_number: `PP${4000000000 + n * 1337}`,
      eta: estimateWindow(delivery, created).to,
      events,
    },
    estimated_delivery: estimateWindow(delivery, created),
    created_at: created.toISOString(),
  };
}

// Bump to refresh demo data in browsers that already have it (v2: ASG rename, 7-day returns).
const SEED_KEY = 'seeded.v2';

/** Creates the demo account + sample data once per browser profile (idempotent per version). */
export function ensureSeeded(): void {
  if (load<boolean>(SEED_KEY, false)) return;
  const user: StoredUser = {
    id: DEMO_ID,
    name: 'Demo Shopper',
    email: DEMO_USER_EMAIL,
    phone: '+1 415 555 0134',
    avatar_url: null,
    passwordHash: weakHash(DEMO_USER_PASSWORD),
    created_at: new Date(Date.now() - 90 * 86_400_000).toISOString(),
  };
  db.setUsers([user, ...db.users().filter((u) => u.id !== DEMO_ID)]);

  const address: Address = {
    id: 'addr_demo_1',
    user_id: DEMO_ID,
    name: 'Demo Shopper',
    phone: '+1 415 555 0134',
    line1: '221 Market Street',
    line2: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'US',
    is_default: true,
  };
  db.setAddresses([address, ...db.addresses().filter((a) => a.id !== address.id)]);

  const orders = [
    makeOrder(2, 4, 'shipped', [{ slug: 'merino-crew-sweater', colorIdx: 0, size: 'M', qty: 1 }]),
    // delivered a few days ago, so it is still inside the 7-day return window
    makeOrder(1, 8, 'delivered', [
      { slug: 'heavyweight-crew-tee', colorIdx: 0, size: 'M', qty: 2 },
      { slug: 'straight-fit-jeans', colorIdx: 0, size: '32', qty: 1 },
    ]),
  ];
  db.setOrders([...orders, ...db.orders().filter((o) => !o.id.startsWith('ord_seed_'))]);
  db.setWishlists({ ...db.wishlists(), [DEMO_ID]: ['p_wrap-midi-dress', 'p_waxed-cotton-jacket'] });
  db.setPayPrefs({
    ...db.payPrefs(),
    [DEMO_ID]: [
      {
        id: 'pm_demo_1',
        brand: 'Visa',
        last4: '4242',
        exp_month: 12,
        exp_year: new Date().getFullYear() + 3,
        is_default: true,
      },
    ],
  });
  db.setNotifications([
    {
      id: 'ntf_seed_1',
      user_id: DEMO_ID,
      type: 'order',
      title: 'Order ASG-100102 has shipped',
      body: 'Your Merino Crewneck Sweater is on its way.',
      read: false,
      created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
    {
      id: 'ntf_seed_2',
      user_id: DEMO_ID,
      type: 'promo',
      title: 'Welcome gift',
      body: 'Use code WELCOME10 for 10% off your next order.',
      read: false,
      created_at: new Date(Date.now() - 20 * 86_400_000).toISOString(),
    },
    ...db.notifications().filter((n) => !n.id.startsWith('ntf_seed_')),
  ]);
  save(SEED_KEY, true);
}
