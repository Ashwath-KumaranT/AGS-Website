import { ApiError, type AuthService } from '@/services/types';
import type { Session } from '@/types';
import { db, delay, RESET_TOKEN_TTL_MS, SESSION_TTL_MS, uid, weakHash } from './db';
import { ensureSeeded } from './seedDemo';
import { getCurrentUser, requireUser, toProfile } from './session';

const listeners = new Set<(s: Session | null) => void>();

function currentSession(): Session | null {
  const user = getCurrentUser();
  const stored = db.session();
  return user && stored ? { user: toProfile(user), expires_at: stored.expiresAt } : null;
}

function emit(): void {
  const s = currentSession();
  listeners.forEach((l) => l(s));
}

function startSession(userId: string): Session {
  db.setSession({ token: uid('tok'), userId, expiresAt: Date.now() + SESSION_TTL_MS });
  const s = currentSession();
  if (!s) throw new ApiError('UNKNOWN', 'Could not start a session.');
  emit();
  return s;
}

// cross-tab sync + expiry polling
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key?.endsWith('session')) emit();
  });
  setInterval(() => {
    if (db.session() && !getCurrentUser()) emit();
  }, 30_000);
}

export const mockAuth: AuthService = {
  async getSession() {
    ensureSeeded();
    return delay(currentSession(), 60);
  },

  async signUp({ name, email, password }) {
    ensureSeeded();
    const normalized = email.trim().toLowerCase();
    if (db.users().some((u) => u.email === normalized)) {
      throw new ApiError(
        'EMAIL_TAKEN',
        'An account with this email already exists. Try signing in.',
      );
    }
    const user = {
      id: uid('user'),
      name: name.trim(),
      email: normalized,
      phone: '',
      avatar_url: null,
      passwordHash: weakHash(password),
      created_at: new Date().toISOString(),
    };
    db.setUsers([...db.users(), user]);
    await delay(null);
    return startSession(user.id);
  },

  async signIn({ email, password }) {
    ensureSeeded();
    const user = db.users().find((u) => u.email === email.trim().toLowerCase());
    await delay(null);
    if (!user || user.passwordHash !== weakHash(password)) {
      throw new ApiError('INVALID_CREDENTIALS', 'Incorrect email or password.');
    }
    return startSession(user.id);
  },

  async signOut() {
    db.setSession(null);
    emit();
    return delay(undefined, 60);
  },

  async requestPasswordReset(email) {
    ensureSeeded();
    const user = db.users().find((u) => u.email === email.trim().toLowerCase());
    await delay(null);
    const token = uid('reset');
    // A token is handed back whether or not the account exists — an unknown address gets a
    // token that resolves to nothing — so the response never reveals who has an account.
    // (A real backend emails the link instead; see the Supabase adapter.)
    if (user) {
      const tokens = db.resetTokens();
      const live = Object.fromEntries(
        Object.entries(tokens).filter(([, t]) => t.expiresAt > Date.now()),
      );
      db.setResetTokens({
        ...live,
        [token]: { userId: user.id, expiresAt: Date.now() + RESET_TOKEN_TTL_MS },
      });
    }
    return { devResetUrl: `/reset-password?token=${token}` };
  },

  async resetPassword({ token, password }) {
    const tokens = db.resetTokens();
    const entry = tokens[token];
    await delay(null);
    if (!entry || entry.expiresAt <= Date.now()) {
      throw new ApiError('VALIDATION', 'This reset link is invalid or has expired.');
    }
    db.setUsers(
      db
        .users()
        .map((u) => (u.id === entry.userId ? { ...u, passwordHash: weakHash(password) } : u)),
    );
    const { [token]: _used, ...rest } = tokens;
    void _used;
    db.setResetTokens(rest);
  },

  async updateProfile({ name, phone }) {
    const user = requireUser();
    const updated = { ...user, name: name.trim(), phone: phone.trim() };
    db.setUsers(db.users().map((u) => (u.id === user.id ? updated : u)));
    await delay(null);
    emit();
    return toProfile(updated);
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
