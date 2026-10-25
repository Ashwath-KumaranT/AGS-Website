import { formatMoney } from './format';
import type { Cents, Coupon, CouponCheck, DeliveryOption, Totals } from '@/types';

export const TAX_RATE = 0.08;
export const MAX_QTY_PER_LINE = 10;

export interface PricedLine {
  unitPrice: Cents;
  compareAtPrice?: Cents | null;
  quantity: number;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'standard',
    label: 'Standard delivery',
    description: 'Free over ₹1,999',
    price: 9900,
    free_over: 199900,
    min_days: 4,
    max_days: 6,
  },
  {
    id: 'express',
    label: 'Express delivery',
    description: 'Tracked, signature on delivery',
    price: 19900,
    free_over: null,
    min_days: 2,
    max_days: 3,
  },
  {
    id: 'next_day',
    label: 'Next-day delivery',
    description: 'Order before 2pm',
    price: 34900,
    free_over: null,
    min_days: 1,
    max_days: 1,
  },
];

export function getDeliveryOption(id: DeliveryOption['id']): DeliveryOption {
  const found = DELIVERY_OPTIONS.find((o) => o.id === id);
  // DELIVERY_OPTIONS is a non-empty constant
  return found ?? (DELIVERY_OPTIONS[0] as DeliveryOption);
}

export function lineTotal(line: PricedLine): Cents {
  return line.unitPrice * line.quantity;
}

export function computeSubtotal(lines: PricedLine[]): Cents {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function computeSavings(lines: PricedLine[]): Cents {
  return lines.reduce((sum, l) => {
    const cmp = l.compareAtPrice;
    return cmp && cmp > l.unitPrice ? sum + (cmp - l.unitPrice) * l.quantity : sum;
  }, 0);
}

/** Validates a coupon against a subtotal. `now` is injectable for tests. */
export function checkCoupon(
  coupon: Coupon | null | undefined,
  subtotal: Cents,
  now: Date = new Date(),
): CouponCheck {
  if (!coupon) return { valid: false, reason: 'That code is not valid.' };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now.getTime()) {
    return { valid: false, reason: `Code ${coupon.code} has expired.` };
  }
  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, reason: `Code ${coupon.code} has reached its usage limit.` };
  }
  if (subtotal < coupon.min_subtotal) {
    return {
      valid: false,
      reason: `Add ${formatMoney(coupon.min_subtotal - subtotal)} more to use ${coupon.code}.`,
    };
  }
  return { valid: true, coupon };
}

export function computeDiscount(coupon: Coupon | null, subtotal: Cents): Cents {
  if (!coupon) return 0;
  if (coupon.type === 'percent') {
    return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  }
  if (coupon.type === 'fixed') return Math.min(subtotal, coupon.value);
  return 0;
}

export function computeShipping(
  delivery: DeliveryOption,
  discountedSubtotal: Cents,
  coupon: Coupon | null,
  hasItems: boolean,
): { shipping: Cents; free: boolean } {
  if (!hasItems) return { shipping: 0, free: false };
  if (coupon?.type === 'free_shipping') return { shipping: 0, free: true };
  if (delivery.free_over !== null && discountedSubtotal >= delivery.free_over) {
    return { shipping: 0, free: true };
  }
  return { shipping: delivery.price, free: delivery.price === 0 };
}

export function computeTotals(input: {
  lines: PricedLine[];
  coupon?: Coupon | null;
  delivery: DeliveryOption;
  taxRate?: number;
}): Totals {
  const { lines, delivery } = input;
  const coupon = input.coupon ?? null;
  const subtotal = computeSubtotal(lines);
  const discount = computeDiscount(coupon, subtotal);
  const discounted = subtotal - discount;
  const { shipping, free } = computeShipping(delivery, discounted, coupon, lines.length > 0);
  const tax = Math.round(discounted * (input.taxRate ?? TAX_RATE));
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: discounted + shipping + tax,
    savings: computeSavings(lines),
    freeShipping: free && lines.length > 0,
  };
}

/** Remaining spend to unlock free standard shipping, or 0 when already unlocked. */
export function amountToFreeShipping(subtotalAfterDiscount: Cents): Cents {
  const threshold = getDeliveryOption('standard').free_over ?? 0;
  return Math.max(0, threshold - subtotalAfterDiscount);
}

export function clampQuantity(quantity: number, stock: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), stock, MAX_QTY_PER_LINE));
}
