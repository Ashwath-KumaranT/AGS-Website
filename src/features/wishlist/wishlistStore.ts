import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  replace: (ids: string[]) => void;
  merge: (ids: string[]) => string[];
  clear: () => void;
}

/**
 * Wishlist ids persist locally (guests included). When signed in, WishlistSync mirrors
 * the list to the backend and merges server-side items on login.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const exists = get().ids.includes(id);
        set({ ids: exists ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !exists;
      },
      has: (id) => get().ids.includes(id),
      replace: (ids) => set({ ids }),
      merge: (ids) => {
        const merged = [...new Set([...get().ids, ...ids])];
        set({ ids: merged });
        return merged;
      },
      clear: () => set({ ids: [] }),
    }),
    { name: 'atelier-wishlist', version: 1 },
  ),
);
