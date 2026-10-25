import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true, menuOpen: false, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  setMenuOpen: (menuOpen) =>
    set({ menuOpen, ...(menuOpen ? { cartOpen: false, searchOpen: false } : {}) }),
  setSearchOpen: (searchOpen) =>
    set({ searchOpen, ...(searchOpen ? { cartOpen: false, menuOpen: false } : {}) }),
}));

/* ---------- recently viewed + recent searches ---------- */

interface RecentState {
  viewed: string[];
  searches: string[];
  addViewed: (productId: string) => void;
  addSearch: (term: string) => void;
  removeSearch: (term: string) => void;
  clearSearches: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      viewed: [],
      searches: [],
      addViewed: (id) =>
        set((s) => ({ viewed: [id, ...s.viewed.filter((v) => v !== id)].slice(0, 12) })),
      addSearch: (term) => {
        const t = term.trim();
        if (t.length < 2) return;
        set((s) => ({
          searches: [t, ...s.searches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
            0,
            6,
          ),
        }));
      },
      removeSearch: (term) => set((s) => ({ searches: s.searches.filter((x) => x !== term) })),
      clearSearches: () => set({ searches: [] }),
    }),
    { name: 'atelier-recent', version: 1 },
  ),
);

/* ---------- theme ---------- */

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('atelier-theme', theme);
  } catch {
    /* ignore */
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme:
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));

/* ---------- toasts ---------- */

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: 'success' | 'error' | 'info';
  action?: { label: string; to?: string; onClick?: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id' | 'tone'> & { tone?: Toast['tone'] }) => void;
  dismiss: (id: number) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = (toastId += 1);
    set((s) => ({ toasts: [...s.toasts.slice(-2), { tone: 'success', ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string, action?: Toast['action']) =>
    useToastStore.getState().push({ title, description, action, tone: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'error' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'info' }),
};
