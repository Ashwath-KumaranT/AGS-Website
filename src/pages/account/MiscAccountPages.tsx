import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CreditCard, RotateCcw, Tag } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Badge, EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { useCartStore } from '@/features/cart/cartStore';
import { qk, usePublicCoupons } from '@/hooks/queries';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDate, formatDateTime, formatMoney } from '@/lib/format';
import { api } from '@/services';
import { toast } from '@/store/uiStore';

function ListSkeleton() {
  const { t } = useT();
  return (
    <div className="space-y-3" role="status" aria-label={t('Loading')}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

/* ---------------- Payment methods ---------------- */

export function PaymentMethodsPage() {
  const { t } = useT();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.payPrefs,
    queryFn: () => api.account.listPaymentPreferences(),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.payPrefs });
  const remove = useMutation({
    mutationFn: (id: string) => api.account.removePaymentPreference(id),
    onSuccess: invalidate,
  });
  const setDefault = useMutation({
    mutationFn: (id: string) => api.account.setDefaultPaymentPreference(id),
    onSuccess: invalidate,
  });

  return (
    <div>
      <Seo title={t('Payment methods')} noindex />
      <h1 className="text-3xl md:text-4xl">{t('Payment methods')}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        {t(
          'Cards are tokenised and stored by our payment provider — we only keep the brand and last four digits.',
        )}
      </p>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon={<CreditCard className="size-6" aria-hidden />}
          title={t('No saved cards')}
          description={t('Cards you choose to save at checkout appear here.')}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="size-6 text-muted" aria-hidden />
                <div>
                  <p className="text-sm font-medium">
                    {p.brand} •••• {p.last4}
                  </p>
                  <p className="text-xs text-muted">
                    {t('Expires {date}', {
                      date: `${String(p.exp_month).padStart(2, '0')}/${p.exp_year}`,
                    })}
                  </p>
                </div>
                {p.is_default && <Badge tone="outline">{t('Default')}</Badge>}
              </div>
              <div className="flex gap-1">
                {!p.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault.mutate(p.id)}>
                    {t('Make default')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sale"
                  onClick={() => remove.mutate(p.id)}
                >
                  {t('Remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Coupons ---------------- */

export function CouponsPage() {
  const { t, tm } = useT();
  const { data, isLoading, isError, refetch } = usePublicCoupons();
  const current = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);

  return (
    <div>
      <Seo title={t('Coupons')} noindex />
      <h1 className="mb-6 text-3xl md:text-4xl">{t('Coupons')}</h1>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon={<Tag className="size-6" aria-hidden />}
          title={t('No coupons right now')}
          description={t('Check back soon for new offers.')}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((c) => (
            <li
              key={c.code}
              className="flex flex-col justify-between rounded-[6px] border border-dashed border-border-strong bg-surface p-5"
            >
              <div>
                <p className="font-display text-2xl tracking-wider">{c.code}</p>
                <p className="mt-1 text-sm">{tm(c.description)}</p>
                <p className="mt-1 text-xs text-muted">
                  {c.min_subtotal > 0
                    ? `${t('Min. spend {amount}', { amount: formatMoney(c.min_subtotal) })} · `
                    : ''}
                  {c.expires_at
                    ? t('Expires {date}', { date: formatDate(c.expires_at) })
                    : t('No expiry')}
                </p>
              </div>
              <Button
                variant={current === c.code ? 'primary' : 'outline'}
                size="sm"
                className="mt-4 self-start"
                onClick={() => {
                  setCoupon(c.code);
                  toast.success(`${c.code} added to your bag`, 'It’ll be applied when eligible.', {
                    label: t('View bag'),
                    to: '/cart',
                  });
                }}
              >
                {current === c.code ? t('Applied to bag') : t('Apply to bag')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Returns ---------------- */

const RETURN_TONE = {
  requested: 'warning',
  approved: 'accent',
  received: 'accent',
  refunded: 'success',
  rejected: 'sale',
} as const;

export function ReturnsPage() {
  const { t } = useT();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.returns,
    queryFn: () => api.orders.listReturns(),
  });
  return (
    <div>
      <Seo title={t('Returns & refunds')} noindex />
      <h1 className="text-3xl md:text-4xl">{t('Returns & refunds')}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        {t('Free returns within 7 days of delivery. Start a return from a delivered order.')}
      </p>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon={<RotateCcw className="size-6" aria-hidden />}
          title={t('No returns')}
          description={t('Return requests you make will appear here.')}
          action={{ label: t('View orders'), to: '/account/orders' }}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r.id} className="rounded-[6px] border border-border bg-surface p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {r.type === 'refund' ? t('Refund') : t('Return')} ·{' '}
                  {t('Order {number}', { number: r.order_number })}
                </p>
                <Badge tone={RETURN_TONE[r.status]}>{t(r.status)}</Badge>
              </div>
              <p className="mt-1 text-muted">
                {r.item_ids.length > 1
                  ? t('{count} items', { count: r.item_ids.length })
                  : t('{count} item', { count: r.item_ids.length })}{' '}
                · {t(r.reason.replace(/_/g, ' '))} ·{' '}
                {t('Requested {date}', { date: formatDate(r.created_at) })}
              </p>
              {r.note && <p className="mt-2">“{r.note}”</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Notifications ---------------- */

export function NotificationsPage() {
  const { t, tm } = useT();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.notifications,
    queryFn: () => api.account.listNotifications(),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.notifications });
  const markOne = useMutation({
    mutationFn: (id: string) => api.account.markNotificationRead(id),
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: () => api.account.markAllNotificationsRead(),
    onSuccess: invalidate,
  });
  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <div>
      <Seo title={t('Notifications')} noindex />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl">{t('Notifications')}</h1>
        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            loading={markAll.isPending}
          >
            {t('Mark all as read')}
          </Button>
        )}
      </div>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon={<Bell className="size-6" aria-hidden />}
          title={t('You’re all caught up')}
          description={t('Order updates and offers will appear here.')}
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {data.map((n) => (
            <li key={n.id} className={cn('flex gap-4 py-4', !n.read && 'bg-subtle/50')}>
              <span
                aria-hidden
                className={cn(
                  'mt-2 size-2 shrink-0 rounded-full',
                  n.read ? 'bg-transparent' : 'bg-accent',
                )}
              />
              <div className="min-w-0 flex-1 text-sm">
                <p className={cn(!n.read && 'font-medium')}>
                  {tm(n.title)}
                  {!n.read && <span className="sr-only"> ({t('unread')})</span>}
                </p>
                <p className="text-muted">{tm(n.body)}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.read && (
                <Button
                  variant="link"
                  className="self-start text-xs"
                  onClick={() => markOne.mutate(n.id)}
                >
                  {t('Mark read')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
