import type {
  Address,
  AppNotification,
  Coupon,
  Order,
  PaymentPreference,
  ReturnRequest,
  Review,
} from '@/types';
import { COUPONS } from './seed';

const PREFIX = 'atelier.mock.v2.'; // bumped when seed pricing changed (USD → INR)

export const LATENCY = import.meta.env.MODE === 'test' ? 0 : 220;

export function delay<T>(value: T, ms = LATENCY): Promise<T> {
  if (ms === 0 || LATENCY === 0) return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms + Math.random() * 120));
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable: mock data is best-effort */
  }
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Demo-grade hash. A real backend uses bcrypt/argon2 via Supabase Auth. */
export function weakHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  passwordHash: string;
  created_at: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface ResetToken {
  userId: string;
  expiresAt: number;
}

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export const DEMO_USER_EMAIL = 'demo@asg.com';
export const DEMO_USER_PASSWORD = 'Demo@1234';

export const db = {
  users: () => load<StoredUser[]>('users', []),
  setUsers: (v: StoredUser[]) => save('users', v),
  session: () => load<StoredSession | null>('session', null),
  setSession: (v: StoredSession | null) => save('session', v),
  addresses: () => load<Address[]>('addresses', []),
  setAddresses: (v: Address[]) => save('addresses', v),
  wishlists: () => load<Record<string, string[]>>('wishlists', {}),
  setWishlists: (v: Record<string, string[]>) => save('wishlists', v),
  orders: () => load<Order[]>('orders', []),
  setOrders: (v: Order[]) => save('orders', v),
  returns: () => load<ReturnRequest[]>('returns', []),
  setReturns: (v: ReturnRequest[]) => save('returns', v),
  notifications: () => load<AppNotification[]>('notifications', []),
  setNotifications: (v: AppNotification[]) => save('notifications', v),
  reviews: () => load<Review[]>('reviews', []),
  setReviews: (v: Review[]) => save('reviews', v),
  // only usage counts are mutable; definitions always come from the seed
  coupons: (): Coupon[] => {
    const used = load<Record<string, number>>('couponUsage', {});
    return COUPONS.map((c) => ({ ...c, times_used: used[c.code] ?? c.times_used }));
  },
  setCoupons: (v: Coupon[]) =>
    save('couponUsage', Object.fromEntries(v.map((c) => [c.code, c.times_used]))),
  payPrefs: () => load<Record<string, PaymentPreference[]>>('payprefs', {}),
  setPayPrefs: (v: Record<string, PaymentPreference[]>) => save('payprefs', v),
  /** variantId -> delta applied on top of seeded inventory */
  inventory: () => load<Record<string, number>>('inventory', {}),
  setInventory: (v: Record<string, number>) => save('inventory', v),
  orderCounter: () => load<number>('orderCounter', 100230),
  setOrderCounter: (v: number) => save('orderCounter', v),
  processedEvents: () => load<string[]>('events', []),
  setProcessedEvents: (v: string[]) => save('events', v),
  resetTokens: () => load<Record<string, ResetToken>>('resetTokens2', {}),
  setResetTokens: (v: Record<string, ResetToken>) => save('resetTokens2', v),
};
