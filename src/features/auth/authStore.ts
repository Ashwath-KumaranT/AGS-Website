import { create } from 'zustand';
import { queryClient } from '@/app/queryClient';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { PERSONAL_QUERY_KEYS } from '@/hooks/queries';
import { api } from '@/services';
import type { Profile, Session } from '@/types';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: Status;
  user: Profile | null;
  /** true once we have seen a session that later vanished (expired / signed out elsewhere) */
  sessionExpired: boolean;
  setSession: (session: Session | null) => void;
  clearExpiredFlag: () => void;
}

/**
 * Everything personal that outlives a sign-out: cached account queries (their keys carry no
 * user id) and the locally persisted wishlist (which the next sign-in would merge into
 * whichever account it finds). Dropped whenever the account changes, however it changes —
 * an explicit sign-out, an expired session, or a switch in another tab.
 */
function forgetPreviousUser(previousUserId: string | null, nextUserId: string | null): void {
  if (previousUserId === null || previousUserId === nextUserId) return;
  for (const queryKey of PERSONAL_QUERY_KEYS) queryClient.removeQueries({ queryKey });
  useWishlistStore.getState().clear();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  sessionExpired: false,
  setSession: (session) => {
    forgetPreviousUser(get().user?.id ?? null, session?.user.id ?? null);
    set({
      status: session ? 'authenticated' : 'anonymous',
      user: session?.user ?? null,
      sessionExpired: session ? false : get().sessionExpired,
    });
  },
  clearExpiredFlag: () => set({ sessionExpired: false }),
}));

/** Marks an unexpected sign-out (expired session) so guards can explain it. */
export function markSessionExpired(): void {
  forgetPreviousUser(useAuthStore.getState().user?.id ?? null, null);
  useAuthStore.setState({ sessionExpired: true, status: 'anonymous', user: null });
}

let initialised = false;

/** Restores the session on boot and keeps the store in sync with the auth backend. */
export function initAuth(): void {
  if (initialised) return;
  initialised = true;
  void api.auth
    .getSession()
    .then((s) => useAuthStore.getState().setSession(s))
    .catch(() => useAuthStore.getState().setSession(null));
  api.auth.subscribe((s) => {
    const prev = useAuthStore.getState();
    if (!s && prev.status === 'authenticated' && prev.user) {
      // signed out without an explicit action → treat as expiry
      if (!explicitSignOut) markSessionExpired();
      else prev.setSession(null);
      explicitSignOut = false;
      return;
    }
    prev.setSession(s);
  });
}

let explicitSignOut = false;
export function signOutExplicitly(): Promise<void> {
  explicitSignOut = true;
  return api.auth.signOut();
}

// In development a hot update can re-create this module, and with it a fresh
// store stuck in 'loading' (App only calls initAuth once). Restore the session again.
if (import.meta.hot) initAuth();
