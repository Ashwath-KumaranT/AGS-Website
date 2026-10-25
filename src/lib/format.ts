import { intlLocale } from '@/i18n';
import type { Cents } from '@/types';

// money keeps one fixed locale so ₹ amounts read the same in every language
const LOCALE = import.meta.env.VITE_LOCALE ?? 'en-IN';
const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'INR';

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
});
const moneyFormatterWhole = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMoney(cents: Cents): string {
  return cents % 100 === 0
    ? moneyFormatterWhole.format(cents / 100)
    : moneyFormatter.format(cents / 100);
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString(
    intlLocale(),
    opts ?? { day: 'numeric', month: 'short', year: 'numeric' },
  );
}

export function formatDateTime(iso: string): string {
  const locale = intlLocale();
  return new Date(iso).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    // Tamil Intl data still prints Latin "AM/PM"; a 24-hour clock reads naturally instead
    hourCycle: locale === 'ta-IN' ? 'h23' : undefined,
  });
}

export function formatDateRange(from: string, to: string): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  const a = formatDate(from, opts);
  const b = formatDate(to, opts);
  return a === b ? a : `${a} – ${b}`;
}

export function percentOff(price: Cents, compareAt: Cents | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function maskCard(last4: string): string {
  return `•••• ${last4}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
