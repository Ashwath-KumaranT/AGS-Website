import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { translate } from '@/i18n';
import { api } from '@/services';
import { toast } from '@/store/uiStore';
import { useWishlistStore } from './wishlistStore';

export function useWishlistToggle(productId: string, title?: string) {
  const active = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  return {
    active,
    toggle: () => {
      const added = toggle(productId);
      // the Toaster translates title/description; the action label is translated here
      toast.success(
        added ? 'Saved to wishlist' : 'Removed from wishlist',
        title,
        added ? { label: translate('View wishlist'), to: '/wishlist' } : undefined,
      );
    },
  };
}

/**
 * Keeps the local wishlist in sync with the account: merges on sign-in and mirrors
 * changes (debounced) while signed in. Mounted once at the app root.
 */
export function useWishlistSync() {
  const userId = useAuthStore((s) => s.user?.id);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      syncedFor.current = null;
      return;
    }
    let cancelled = false;

    /** Merges the account's list with the local one, then mirrors the result back. */
    const mergeWithAccount = async () => {
      const remote = await api.account.getWishlist();
      if (cancelled) return;
      const merged = useWishlistStore.getState().merge(remote);
      // claim the sync before writing: a toggle made while the write is in flight must be
      // picked up by the subscriber below rather than silently overwritten by `merged`
      syncedFor.current = userId;
      try {
        await api.account.setWishlist(merged);
      } catch (e) {
        syncedFor.current = null;
        throw e;
      }
      if (cancelled) return;
      const latest = useWishlistStore.getState().ids;
      if (latest !== merged) await api.account.setWishlist(latest);
    };

    void mergeWithAccount().catch(() => {
      /* offline or a failed read: the subscriber below retries on the next change */
    });

    let timer: ReturnType<typeof setTimeout>;
    const unsub = useWishlistStore.subscribe((state, prev) => {
      if (state.ids === prev.ids) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        // a first sync that failed left us unmerged; redo it rather than overwriting the
        // account's list with a local one that never saw it
        if (syncedFor.current !== userId) {
          void mergeWithAccount().catch(() => undefined);
          return;
        }
        void api.account.setWishlist(state.ids).catch(() => undefined);
      }, 400);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub();
    };
  }, [userId]);
}
