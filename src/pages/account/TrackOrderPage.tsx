import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { OrderStatusBadge, TrackingTimeline } from '@/features/orders/components';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { formatDate, formatDateTime } from '@/lib/format';
import { api } from '@/services';

export default function TrackOrderPage() {
  const { t, tm } = useT();
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: qk.order(id),
    queryFn: () => api.orders.getOrder(id),
    refetchInterval: 30_000,
  });
  const advance = useMutation({
    mutationFn: () => {
      if (!api.orders.advanceOrderDemo) throw new Error('Not available');
      return api.orders.advanceOrderDemo(id);
    },
    onSuccess: (o) => {
      qc.setQueryData(qk.order(id), o);
      void qc.invalidateQueries({ queryKey: qk.orders });
      void qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!order || !order.shipment) {
    return (
      <EmptyState
        title={t('Tracking not available')}
        description={t('Tracking appears once your order is confirmed.')}
        action={{ label: t('Back to orders'), to: '/account/orders' }}
      />
    );
  }

  const events = [...order.shipment.events].reverse();

  return (
    <div className="max-w-2xl">
      <Seo title={t('Track {number}', { number: order.number })} noindex />
      <Breadcrumbs
        items={[
          { label: t('Orders'), to: '/account/orders' },
          { label: order.number, to: `/account/orders/${order.id}` },
          { label: t('Track') },
        ]}
      />
      <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl">{t('Track your order')}</h1>
          <p className="mt-1 text-sm text-muted">
            {order.shipment.carrier} · {t('Tracking no.')}{' '}
            <span className="font-medium text-fg">{order.shipment.tracking_number}</span>
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-[6px] bg-subtle p-5">
        <Truck className="size-8 text-accent" aria-hidden />
        <div>
          <p className="text-sm text-muted">
            {order.status === 'delivered' ? t('Delivered') : t('Estimated delivery')}
          </p>
          <p className="font-display text-2xl">
            {order.status === 'delivered'
              ? formatDate(events[0]?.at ?? order.shipment.eta)
              : formatDate(order.shipment.eta, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <section className="rounded-[6px] border border-border p-5" aria-labelledby="t-h">
        <h2 id="t-h" className="mb-5 text-xl">
          {t('Progress')}
        </h2>
        <TrackingTimeline order={order} />
      </section>

      <section className="mt-6" aria-labelledby="h-h">
        <h2 id="h-h" className="mb-3 text-xl">
          {t('History')}
        </h2>
        <ul className="divide-y divide-border border-y border-border text-sm">
          {events.map((e) => (
            <li key={e.at + e.label} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-medium">{tm(e.label)}</span>
                <span className="block text-muted">{tm(e.location)}</span>
              </span>
              <time dateTime={e.at} className="shrink-0 text-muted">
                {formatDateTime(e.at)}
              </time>
            </li>
          ))}
        </ul>
      </section>

      {api.orders.advanceOrderDemo &&
        !['delivered', 'cancelled', 'refunded'].includes(order.status) && (
          <div className="mt-8 rounded-[4px] border border-dashed border-border-strong p-4 text-sm">
            <p className="font-medium">{t('Demo mode')}</p>
            <p className="mt-1 text-muted">
              {t('There’s no real carrier in the demo — simulate the next tracking update.')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              loading={advance.isPending}
              onClick={() => advance.mutate()}
            >
              {t('Simulate next update')}
            </Button>
          </div>
        )}
    </div>
  );
}
