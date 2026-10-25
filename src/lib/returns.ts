import type { Order } from '@/types';

/** Return policy: free returns within this many days of delivery. */
export const RETURN_WINDOW_DAYS = 7;

const DAY_MS = 86_400_000;

/** When the order was delivered, taken from the carrier's "delivered" tracking event. */
export function deliveredAt(order: Pick<Order, 'status' | 'shipment'>): Date | null {
  if (order.status !== 'delivered') return null;
  const event = order.shipment?.events.filter((e) => e.status === 'delivered').at(-1);
  return event ? new Date(event.at) : null;
}

export interface ReturnWindow {
  /** a return can be requested right now */
  open: boolean;
  /** last moment a return can be requested; null until the order is delivered */
  deadline: Date | null;
}

export function returnWindow(
  order: Pick<Order, 'status' | 'shipment'>,
  now: Date = new Date(),
): ReturnWindow {
  const delivered = deliveredAt(order);
  if (!delivered) return { open: false, deadline: null };
  const deadline = new Date(delivered.getTime() + RETURN_WINDOW_DAYS * DAY_MS);
  return { open: now.getTime() <= deadline.getTime(), deadline };
}
