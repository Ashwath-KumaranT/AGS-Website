import { ApiError } from '@/services/types';
import type { Profile } from '@/types';
import { db, type StoredUser } from './db';

export function toProfile(u: StoredUser): Profile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar_url: u.avatar_url,
    created_at: u.created_at,
  };
}

/** Returns the signed-in user, or null when signed out or the session has expired. */
export function getCurrentUser(): StoredUser | null {
  const session = db.session();
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    db.setSession(null);
    return null;
  }
  return db.users().find((u) => u.id === session.userId) ?? null;
}

export function requireUser(): StoredUser {
  const user = getCurrentUser();
  if (!user) throw new ApiError('AUTH_REQUIRED', 'Your session has expired. Please sign in again.');
  return user;
}
