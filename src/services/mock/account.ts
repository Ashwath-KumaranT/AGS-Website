import { addressSchema } from '@/lib/validation';
import { ApiError, type AccountService } from '@/services/types';
import type { Address } from '@/types';
import { db, delay, uid } from './db';
import { requireUser } from './session';

export const mockAccount: AccountService = {
  async listAddresses() {
    const user = requireUser();
    return delay(
      db
        .addresses()
        .filter((a) => a.user_id === user.id)
        .sort((a, b) => Number(b.is_default) - Number(a.is_default)),
      100,
    );
  },

  async saveAddress(input, id) {
    const user = requireUser();
    const parsed = addressSchema.safeParse({ ...input, line2: input.line2 ?? '' });
    if (!parsed.success)
      throw new ApiError('VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid address');
    const all = db.addresses();
    const mine = all.filter((a) => a.user_id === user.id);
    const makeDefault = Boolean(input.is_default) || mine.length === 0;
    let saved: Address;
    let next: Address[];
    if (id) {
      const existing = mine.find((a) => a.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', 'Address not found');
      saved = { ...existing, ...parsed.data, is_default: makeDefault || existing.is_default };
      next = all.map((a) => (a.id === id ? saved : a));
    } else {
      saved = { id: uid('addr'), user_id: user.id, ...parsed.data, is_default: makeDefault };
      next = [...all, saved];
    }
    if (saved.is_default) {
      next = next.map((a) =>
        a.user_id === user.id && a.id !== saved.id ? { ...a, is_default: false } : a,
      );
    }
    db.setAddresses(next);
    return delay(saved, 120);
  },

  async deleteAddress(id) {
    const user = requireUser();
    const mine = db.addresses().filter((a) => a.user_id === user.id);
    const removed = mine.find((a) => a.id === id);
    let next = db.addresses().filter((a) => a.id !== id);
    if (removed?.is_default) {
      const first = next.find((a) => a.user_id === user.id);
      if (first) next = next.map((a) => (a.id === first.id ? { ...a, is_default: true } : a));
    }
    db.setAddresses(next);
    await delay(null, 100);
  },

  async setDefaultAddress(id) {
    const user = requireUser();
    db.setAddresses(
      db.addresses().map((a) => (a.user_id === user.id ? { ...a, is_default: a.id === id } : a)),
    );
    await delay(null, 100);
  },

  async getWishlist() {
    const user = requireUser();
    return delay(db.wishlists()[user.id] ?? [], 80);
  },

  async setWishlist(productIds) {
    const user = requireUser();
    db.setWishlists({ ...db.wishlists(), [user.id]: [...new Set(productIds)] });
    await delay(null, 60);
  },

  async listNotifications() {
    const user = requireUser();
    return delay(
      db
        .notifications()
        .filter((n) => n.user_id === user.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      100,
    );
  },

  async markNotificationRead(id) {
    const user = requireUser();
    db.setNotifications(
      db
        .notifications()
        .map((n) => (n.id === id && n.user_id === user.id ? { ...n, read: true } : n)),
    );
    await delay(null, 40);
  },

  async markAllNotificationsRead() {
    const user = requireUser();
    db.setNotifications(
      db.notifications().map((n) => (n.user_id === user.id ? { ...n, read: true } : n)),
    );
    await delay(null, 60);
  },

  async listPaymentPreferences() {
    const user = requireUser();
    return delay(db.payPrefs()[user.id] ?? [], 80);
  },

  async removePaymentPreference(id) {
    const user = requireUser();
    const prefs = db.payPrefs();
    const list = (prefs[user.id] ?? []).filter((p) => p.id !== id);
    if (list.length && !list.some((p) => p.is_default))
      list[0] = { ...(list[0] as (typeof list)[number]), is_default: true };
    db.setPayPrefs({ ...prefs, [user.id]: list });
    await delay(null, 60);
  },

  async setDefaultPaymentPreference(id) {
    const user = requireUser();
    const prefs = db.payPrefs();
    db.setPayPrefs({
      ...prefs,
      [user.id]: (prefs[user.id] ?? []).map((p) => ({ ...p, is_default: p.id === id })),
    });
    await delay(null, 60);
  },
};
