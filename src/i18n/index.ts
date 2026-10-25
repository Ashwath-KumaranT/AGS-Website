/**
 * Lightweight i18n. English source strings are the keys (gettext style):
 *
 *   const { t } = useT();
 *   t('Add to bag')                      → "பையில் சேர்"
 *   t('Only {count} left', { count: 3 }) → "{count}" is filled in both languages
 *
 * Tamil translations live in src/i18n/ta/*.ts (each file default-exports a
 * Record<english, tamil>) and are merged automatically. A missing translation
 * falls back to English, and src/i18n/coverage.test.ts fails the build if any
 * t('…') literal in the source has no Tamil entry.
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'ta';
export type Dict = Record<string, string>;
export type Vars = Record<string, string | number>;

const modules = import.meta.glob<{ default: Dict }>('./ta/*.ts', { eager: true });

export const TA: Dict = {};
for (const mod of Object.values(modules)) Object.assign(TA, mod.default);

export const LOCALES: { id: Locale; label: string; short: string; htmlLang: string }[] = [
  { id: 'en', label: 'English', short: 'EN', htmlLang: 'en' },
  { id: 'ta', label: 'தமிழ்', short: 'தமிழ்', htmlLang: 'ta' },
];

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function applyHtmlLang(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = LOCALES.find((l) => l.id === locale)?.htmlLang ?? 'en';
  }
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        applyHtmlLang(locale);
        set({ locale });
      },
    }),
    {
      name: 'atelier-locale',
      version: 1,
      onRehydrateStorage: () => (state) => applyHtmlLang(state?.locale ?? 'en'),
    },
  ),
);

export function currentLocale(): Locale {
  return useLocaleStore.getState().locale;
}

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : whole,
  );
}

/**
 * Translates an English source string. Use this outside React (toasts, stores, services).
 * A `|context` suffix lets one English word have several translations, e.g.
 * t('Wishlist|short') shows "Wishlist" in English but a shorter Tamil word.
 */
export function translate(key: string, vars?: Vars, locale: Locale = currentLocale()): string {
  if (locale === 'ta') {
    const hit = TA[key];
    if (hit) return fill(hit, vars);
  }
  const bar = key.indexOf('|');
  return fill(bar === -1 ? key : key.slice(0, bar), vars);
}

/* ---------- translating finished sentences (server/validation messages, toasts) ---------- */

interface Pattern {
  re: RegExp;
  names: string[];
  template: string;
}

let patternCache: Pattern[] | null = null;

function patterns(): Pattern[] {
  if (patternCache) return patternCache;
  patternCache = Object.entries(TA)
    .filter(([key]) => /\{\w+\}/.test(key))
    .map(([key, template]) => {
      const names: string[] = [];
      const source = key
        .split(/(\{\w+\})/)
        .map((part) => {
          const m = /^\{(\w+)\}$/.exec(part);
          if (m) {
            names.push(m[1] as string);
            return '(.+?)';
          }
          return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('');
      return { re: new RegExp(`^${source}$`), names, template };
    })
    // most specific (longest literal text) first
    .sort((a, b) => b.re.source.length - a.re.source.length);
  return patternCache;
}

/**
 * Translates an already-built English sentence, e.g. an API error
 * "Only 3 left of Merino Sweater (Navy, M)." Exact matches win; otherwise the
 * sentence is matched against templated keys and the captured values are
 * themselves translated when possible.
 */
export function translateMessage(message: string, locale: Locale = currentLocale()): string {
  if (locale !== 'ta' || !message) return message;
  const exact = TA[message];
  if (exact) return exact;
  for (const p of patterns()) {
    const m = p.re.exec(message);
    if (!m) continue;
    const captured = p.names.map((_, i) => m[i + 1] ?? '');
    // A multi-word capture must itself be translatable (e.g. a product title);
    // otherwise a short key like 'Order {number}' would swallow an untranslated
    // sentence and produce half-Tamil, half-English text.
    if (captured.some((raw) => /\s/.test(raw.trim()) && !TA[raw])) continue;
    const vars: Vars = {};
    p.names.forEach((name, i) => {
      const raw = captured[i] ?? '';
      vars[name] = TA[raw] ?? raw;
    });
    return fill(p.template, vars);
  }
  return message;
}

/** Date/number locale for Intl APIs. Money always uses en-IN so ₹ amounts look identical. */
export function intlLocale(locale: Locale = currentLocale()): string {
  return locale === 'ta' ? 'ta-IN' : 'en-IN';
}

export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}

/** React hook: re-renders the component when the language changes. */
export function useT() {
  const locale = useLocale();
  return useMemo(
    () => ({
      locale,
      t: (key: string, vars?: Vars) => translate(key, vars, locale),
      /** translate a finished sentence (API error, validation message) */
      tm: (message: string) => translateMessage(message, locale),
    }),
    [locale],
  );
}
