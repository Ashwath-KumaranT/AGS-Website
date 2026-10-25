import { AlertTriangle, Check, Minus, PackageOpen, Plus, Star, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { formatMoney, percentOff } from '@/lib/format';
import { useT } from '@/i18n';
import { useToastStore } from '@/store/uiStore';
import type { Cents } from '@/types';
import { Button, ButtonLink } from './Button';

/* ---------------- Badge ---------------- */

const badgeTones = {
  neutral: 'bg-subtle text-fg',
  dark: 'bg-fg text-bg',
  sale: 'bg-sale text-white',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  accent: 'bg-accent text-accent-fg',
  outline: 'border border-border-strong text-fg',
} as const;

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof badgeTones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[2px] px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em]',
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('skeleton rounded-[3px]', className)} {...props} />;
}

/* ---------------- Price ---------------- */

export function Price({
  price,
  compareAt,
  className,
  size = 'md',
  showPercent = false,
}: {
  price: Cents;
  compareAt?: Cents | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}) {
  const { t } = useT();
  const onSale = compareAt != null && compareAt > price;
  const pct = percentOff(price, compareAt ?? null);
  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-baseline gap-x-2',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-[0.9375rem]',
        size === 'lg' && 'text-xl',
        className,
      )}
    >
      <span className={cn('font-medium tabular-nums', onSale && 'text-sale')}>
        <span className="sr-only">{onSale ? t('Sale price') : t('Price')} </span>
        {formatMoney(price)}
      </span>
      {onSale && (
        <>
          <span className="text-muted tabular-nums line-through">
            <span className="sr-only">{t('Original price')} </span>
            {formatMoney(compareAt)}
          </span>
          {showPercent && pct > 0 && (
            <span className="text-xs font-medium text-sale">{t('{pct}% off', { pct })}</span>
          )}
        </>
      )}
    </span>
  );
}

/* ---------------- Rating ---------------- */

export function Rating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  const { t } = useT();
  const rating = value.toFixed(1);
  const label =
    count === undefined
      ? t('Rated {rating} out of 5', { rating })
      : count === 1
        ? t('Rated {rating} out of 5 from {count} review', { rating, count })
        : t('Rated {rating} out of 5 from {count} reviews', { rating, count });
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}
      role="img"
      aria-label={label}
    >
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star
                width={size}
                height={size}
                className="absolute inset-0 text-border-strong"
                strokeWidth={1.5}
              />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star width={size} height={size} className="fill-fg text-fg" strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </span>
      {count !== undefined && <span aria-hidden>({count})</span>}
    </span>
  );
}

/* ---------------- Quantity selector ---------------- */

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  label,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const { t, tm } = useT();
  const btn = cn(
    'inline-flex items-center justify-center text-fg transition-colors hover:bg-subtle disabled:opacity-40 disabled:hover:bg-transparent',
    size === 'md' ? 'size-11' : 'size-9',
  );
  return (
    <div
      role="group"
      aria-label={label ? tm(label) : t('Quantity')}
      className="inline-flex items-center rounded-[3px] border border-border-strong"
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t('Decrease quantity')}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span
        className={cn(
          'text-center text-sm font-medium tabular-nums',
          size === 'md' ? 'w-9' : 'w-7',
        )}
        aria-live="polite"
        data-testid="qty-value"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t('Increase quantity')}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/* ---------------- States ---------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; to: string };
  icon?: ReactNode;
  className?: string;
}) {
  const { tm } = useT();
  return (
    <div className={cn('flex flex-col items-center px-4 py-16 text-center', className)}>
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-subtle text-muted">
        {icon ?? <PackageOpen className="size-6" aria-hidden />}
      </div>
      <h2 className="font-display text-2xl">{tm(title)}</h2>
      {description && <p className="mt-2 max-w-sm text-muted">{tm(description)}</p>}
      {action && (
        <ButtonLink to={action.to} className="mt-6" variant="primary">
          {tm(action.label)}
        </ButtonLink>
      )}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { t, tm } = useT();
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center px-4 py-16 text-center', className)}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-sale/10 text-sale">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="font-display text-2xl">{title ? tm(title) : t('Something went wrong')}</h2>
      <p className="mt-2 max-w-sm text-muted">
        {message ? tm(message) : t('We could not load this. Check your connection and try again.')}
      </p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry} variant="outline">
          {t('Try again')}
        </Button>
      )}
    </div>
  );
}

export function InlineAlert({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'error' | 'success' | 'warning';
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: 'border-border bg-subtle',
    error: 'border-sale/40 bg-sale/10 text-sale',
    success: 'border-success/40 bg-success/10 text-success',
    warning: 'border-warning/40 bg-warning/10 text-warning',
  } as const;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-[3px] border px-3.5 py-3 text-sm', tones[tone], className)}
    >
      {children}
    </div>
  );
}

/* ---------------- Breadcrumbs ---------------- */

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { t } = useT();
  return (
    <nav aria-label={t('Breadcrumb')} className="text-[0.8125rem] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.to ? (
              <Link to={item.to} className="hover:text-fg hover:underline underline-offset-4">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------------- Pagination ---------------- */

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const { t } = useT();
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav aria-label={t('Pagination')} className="mt-12 flex items-center justify-center gap-1">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('Previous')}
      </Button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={t('Page {page}', { page: p })}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded-[3px] text-sm tabular-nums transition-colors',
            p === page ? 'bg-fg text-bg' : 'hover:bg-subtle',
          )}
        >
          {p}
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        {t('Next')}
      </Button>
    </nav>
  );
}

/* ---------------- Accordion ---------------- */

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-b border-border" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <Plus
          className="size-4 transition-transform duration-200 group-open:rotate-45"
          aria-hidden
        />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}

/* ---------------- Toasts ---------------- */

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  const { t, tm } = useT();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[200] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className="animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[4px] bg-fg px-4 py-3 text-bg shadow-xl"
        >
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
              toast.tone === 'error' ? 'bg-sale text-white' : 'bg-bg/20 text-bg',
            )}
          >
            {toast.tone === 'error' ? (
              <X className="size-3" aria-hidden />
            ) : (
              <Check className="size-3" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">{tm(toast.title)}</p>
            {toast.description && <p className="mt-0.5 opacity-80">{tm(toast.description)}</p>}
            {toast.action &&
              (toast.action.to ? (
                <Link
                  to={toast.action.to}
                  className="mt-1.5 inline-block font-medium underline underline-offset-4"
                >
                  {tm(toast.action.label)}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={toast.action.onClick}
                  className="mt-1.5 font-medium underline underline-offset-4"
                >
                  {tm(toast.action.label)}
                </button>
              ))}
          </div>
          <button
            type="button"
            aria-label={t('Dismiss notification')}
            onClick={() => dismiss(toast.id)}
            className="-m-2 p-2 opacity-70 hover:opacity-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
