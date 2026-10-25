import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/types';
import {
  acknowledgePrice,
  addLine,
  removeLine,
  setLineQuantity,
  toggleSaved,
  type AddInput,
  type AddResult,
} from './cartLogic';

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  add: (input: AddInput) => AddResult;
  setQuantity: (variantId: string, quantity: number, stock: number) => void;
  remove: (variantId: string) => void;
  toggleSaved: (variantId: string) => void;
  acknowledgePrice: (variantId: string, price: number) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
      add: (input) => {
        const result = addLine(get().lines, input);
        set({ lines: result.lines });
        return result;
      },
      setQuantity: (variantId, quantity, stock) =>
        set((s) => ({ lines: setLineQuantity(s.lines, variantId, quantity, stock) })),
      remove: (variantId) => set((s) => ({ lines: removeLine(s.lines, variantId) })),
      toggleSaved: (variantId) => set((s) => ({ lines: toggleSaved(s.lines, variantId) })),
      acknowledgePrice: (variantId, price) =>
        set((s) => ({ lines: acknowledgePrice(s.lines, variantId, price) })),
      setCoupon: (couponCode) => set({ couponCode }),
      clear: () => set({ lines: [], couponCode: null }),
    }),
    {
      name: 'atelier-cart',
      // v2: prices moved from USD to INR — discard bags saved with old prices
      version: 2,
      migrate: () => ({ lines: [], couponCode: null }) as unknown as CartState,
    },
  ),
);
