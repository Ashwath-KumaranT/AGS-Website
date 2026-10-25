import type { DeliveryCheck, DeliveryOption } from '@/types';
import { DELIVERY_OPTIONS } from './pricing';

/** Adds business days (Mon–Sat; Sunday is skipped). */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) remaining -= 1;
  }
  return d;
}

export function estimateWindow(
  option: Pick<DeliveryOption, 'min_days' | 'max_days'>,
  from: Date = new Date(),
): { from: string; to: string } {
  return {
    from: addBusinessDays(from, option.min_days).toISOString(),
    to: addBusinessDays(from, option.max_days).toISOString(),
  };
}

export function isValidPostalCode(code: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(code.trim());
}

/**
 * Mock serviceability rule: postal codes ending in "000" are not serviceable.
 * The Supabase adapter replaces this with a lookup table.
 */
export function checkDeliveryForPostalCode(code: string, from: Date = new Date()): DeliveryCheck {
  if (!isValidPostalCode(code)) {
    return { serviceable: false, options: [], message: 'Enter a valid postal code.' };
  }
  if (code.trim().endsWith('000')) {
    return {
      serviceable: false,
      options: [],
      message: "Sorry, we don't deliver to this area yet.",
    };
  }
  return {
    serviceable: true,
    options: DELIVERY_OPTIONS.map((o) => ({ id: o.id, ...estimateWindow(o, from) })),
    message: 'Delivery available.',
  };
}
