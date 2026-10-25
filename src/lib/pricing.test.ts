import { describe, expect, it } from 'vitest';
import type { Coupon } from '@/types';
import {
  amountToFreeShipping,
  checkCoupon,
  clampQuantity,
  computeDiscount,
  computeTotals,
  getDeliveryOption,
} from './pricing';

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  code: 'TEST',
  type: 'percent',
  value: 10,
  min_subtotal: 0,
  expires_at: null,
  description: '',
  usage_limit: null,
  times_used: 0,
  is_public: true,
  ...over,
});

const standard = getDeliveryOption('standard');
const express = getDeliveryOption('express');

describe('computeTotals', () => {
  it('sums lines, charges standard shipping under the threshold and adds tax', () => {
    const t = computeTotals({ lines: [{ unitPrice: 129900, quantity: 1 }], delivery: standard });
    expect(t).toMatchObject({
      subtotal: 129900,
      discount: 0,
      shipping: 9900,
      tax: 10392,
      total: 150192,
      freeShipping: false,
    });
  });

  it('makes standard shipping free at ₹1,999 after discount', () => {
    const t = computeTotals({ lines: [{ unitPrice: 110000, quantity: 2 }], delivery: standard });
    expect(t.shipping).toBe(0);
    expect(t.freeShipping).toBe(true);
    // 10% off drops it to ₹1,980 → shipping is charged again
    const t2 = computeTotals({
      lines: [{ unitPrice: 110000, quantity: 2 }],
      delivery: standard,
      coupon: coupon(),
    });
    expect(t2.discount).toBe(22000);
    expect(t2.shipping).toBe(9900);
  });

  it('never makes express free via the threshold', () => {
    const t = computeTotals({ lines: [{ unitPrice: 500000, quantity: 1 }], delivery: express });
    expect(t.shipping).toBe(19900);
  });

  it('applies free-shipping coupons to any delivery option', () => {
    const t = computeTotals({
      lines: [{ unitPrice: 1000, quantity: 1 }],
      delivery: express,
      coupon: coupon({ type: 'free_shipping' }),
    });
    expect(t.shipping).toBe(0);
    expect(t.discount).toBe(0);
  });

  it('reports sale savings from compare-at prices', () => {
    const t = computeTotals({
      lines: [{ unitPrice: 3200, compareAtPrice: 4200, quantity: 2 }],
      delivery: standard,
    });
    expect(t.savings).toBe(2000);
  });

  it('returns zeros for an empty cart', () => {
    const t = computeTotals({ lines: [], delivery: standard });
    expect(t).toMatchObject({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  });
});

describe('computeDiscount', () => {
  it('rounds percentage discounts to the cent', () => {
    expect(computeDiscount(coupon({ value: 15 }), 3333)).toBe(500);
  });
  it('caps fixed discounts at the subtotal', () => {
    expect(computeDiscount(coupon({ type: 'fixed', value: 5000 }), 3000)).toBe(3000);
  });
});

describe('checkCoupon', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  it('rejects missing codes', () => {
    expect(checkCoupon(undefined, 1000, now).valid).toBe(false);
  });
  it('rejects expired codes', () => {
    const r = checkCoupon(coupon({ expires_at: '2026-05-01T00:00:00Z' }), 1000, now);
    expect(r).toEqual({ valid: false, reason: 'Code TEST has expired.' });
  });
  it('rejects codes that hit their usage limit', () => {
    expect(checkCoupon(coupon({ usage_limit: 1, times_used: 1 }), 1000, now).valid).toBe(false);
  });
  it('explains the minimum spend', () => {
    const r = checkCoupon(coupon({ min_subtotal: 10000 }), 7550, now);
    expect(r).toEqual({ valid: false, reason: 'Add ₹24.50 more to use TEST.' });
  });
  it('accepts valid codes', () => {
    expect(checkCoupon(coupon(), 1000, now).valid).toBe(true);
  });
});

describe('helpers', () => {
  it('clamps quantity to stock and the per-line limit', () => {
    expect(clampQuantity(5, 3)).toBe(3);
    expect(clampQuantity(25, 100)).toBe(10);
    expect(clampQuantity(-1, 5)).toBe(0);
  });
  it('computes the amount left for free shipping', () => {
    expect(amountToFreeShipping(150000)).toBe(49900);
    expect(amountToFreeShipping(200000)).toBe(0);
  });
});
