import { describe, expect, it } from 'vitest';
import type { CartLine } from '@/types';
import { addLine, itemCount, removeLine, setLineQuantity, toggleSaved } from './cartLogic';
import { useCartStore } from './cartStore';

const base = { variantId: 'v1', productId: 'p1', stock: 5, price: 3800 };

describe('cart logic', () => {
  it('adds a new line', () => {
    const r = addLine([], { ...base, quantity: 2 });
    expect(r.lines).toEqual([
      { variantId: 'v1', productId: 'p1', quantity: 2, savedForLater: false, addedPrice: 3800 },
    ]);
    expect(r.capped).toBe(false);
  });

  it('merges quantities for the same variant and caps at stock', () => {
    const first = addLine([], { ...base, quantity: 3 }).lines;
    const r = addLine(first, { ...base, quantity: 4 });
    expect(r.lines).toHaveLength(1);
    expect(r.quantity).toBe(5);
    expect(r.capped).toBe(true);
  });

  it('refuses sold-out variants', () => {
    const r = addLine([], { ...base, stock: 0, quantity: 1 });
    expect(r.lines).toHaveLength(0);
    expect(r.capped).toBe(true);
  });

  it('moves a saved-for-later line back to the cart when re-added', () => {
    const saved: CartLine[] = [
      { variantId: 'v1', productId: 'p1', quantity: 2, savedForLater: true, addedPrice: 3800 },
    ];
    const r = addLine(saved, { ...base, quantity: 1 });
    expect(r.lines[0]).toMatchObject({ savedForLater: false, quantity: 1 });
  });

  it('updates, removes and toggles lines', () => {
    let lines = addLine([], { ...base, quantity: 1 }).lines;
    lines = setLineQuantity(lines, 'v1', 4, 5);
    expect(lines[0]?.quantity).toBe(4);
    lines = setLineQuantity(lines, 'v1', 9, 5);
    expect(lines[0]?.quantity).toBe(5);
    lines = toggleSaved(lines, 'v1');
    expect(itemCount(lines)).toBe(0);
    lines = toggleSaved(lines, 'v1');
    expect(itemCount(lines)).toBe(5);
    expect(setLineQuantity(lines, 'v1', 0, 5)).toEqual([]);
    expect(removeLine(lines, 'v1')).toEqual([]);
  });
});

describe('cart store', () => {
  it('persists lines and coupon to localStorage', () => {
    useCartStore.getState().clear();
    useCartStore.getState().add({ ...base, quantity: 1 });
    useCartStore.getState().setCoupon('WELCOME10');
    const stored = JSON.parse(localStorage.getItem('atelier-cart') ?? '{}');
    expect(stored.state.lines).toHaveLength(1);
    expect(stored.state.couponCode).toBe('WELCOME10');
    useCartStore.getState().clear();
    expect(useCartStore.getState().lines).toEqual([]);
  });
});
