import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { ProductImage } from '@/components/ui/ProductImage';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { OrderStatusBadge } from '@/features/orders/components';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { formatDate, formatMoney } from '@/lib/format';
import { api } from '@/services';

export default function OrdersPage() {
  const { t } = useT();
  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: qk.orders, queryFn: () => api.orders.listOrders() });

  return (
    <div>
      <Seo title={t('Orders')} noindex />
      <h1 className="mb-6 text-3xl md:text-4xl">{t('Orders')}</h1>
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label={t('Loading orders')}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" aria-hidden />}
          title={t('No orders yet')}
          description={t('When you place an order, it’ll show up here.')}
          action={{ label: t('Start shopping'), to: '/shop' }}
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const count = o.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <li key={o.id}>
                <Link
                  to={`/account/orders/${o.id}`}
                  className="block rounded-[6px] border border-border bg-surface p-4 transition-colors hover:border-fg md:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t('Order {number}', { number: o.number })}</p>
                      <p className="text-[0.8125rem] text-muted">
                        {t('Placed {date}', { date: formatDate(o.created_at) })} ·{' '}
                        {count === 1 ? t('{count} item', { count }) : t('{count} items', { count })}{' '}
                        · {formatMoney(o.totals.total)}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    {o.items.slice(0, 5).map((i) => (
                      <ProductImage
                        key={i.id}
                        src={i.image_url}
                        alt={t(i.title)}
                        className="aspect-[4/5] w-14 rounded-[3px]"
                      />
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
