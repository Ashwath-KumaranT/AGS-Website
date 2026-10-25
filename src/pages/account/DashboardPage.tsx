import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, Heart, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { ProductImage } from '@/components/ui/ProductImage';
import { Skeleton } from '@/components/ui/primitives';
import { useAuthStore } from '@/features/auth/authStore';
import { OrderStatusBadge } from '@/features/orders/components';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { useT } from '@/i18n';
import { qk } from '@/hooks/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { api } from '@/services';

export default function DashboardPage() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const wishCount = useWishlistStore((s) => s.ids.length);
  const orders = useQuery({ queryKey: qk.orders, queryFn: () => api.orders.listOrders() });
  const addresses = useQuery({
    queryKey: qk.addresses,
    queryFn: () => api.account.listAddresses(),
  });
  const notifications = useQuery({
    queryKey: qk.notifications,
    queryFn: () => api.account.listNotifications(),
  });
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const latest = orders.data?.find((o) => o.status !== 'payment_failed');

  const cards = [
    { to: '/account/orders', icon: Package, label: 'Orders', value: orders.data?.length ?? '—' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist', value: wishCount },
    {
      to: '/account/addresses',
      icon: MapPin,
      label: 'Addresses',
      value: addresses.data?.length ?? '—',
    },
    { to: '/account/notifications', icon: Bell, label: 'Unread notifications', value: unread },
  ];

  return (
    <div>
      <Seo title={t('My account')} noindex />
      <h1 className="text-3xl md:text-4xl">
        {t('Hello, {name}', { name: user?.name.split(' ')[0] ?? '' })}
      </h1>
      <p className="mt-1 text-muted">{t('Manage your orders, details and preferences.')}</p>

      <ul className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ to, icon: Icon, label, value }) => (
          <li key={label}>
            <Link
              to={to}
              className="flex h-full flex-col rounded-[6px] border border-border bg-surface p-4 transition-colors hover:border-fg"
            >
              <Icon className="size-5 text-accent" aria-hidden />
              <span className="mt-4 font-display text-3xl">{value}</span>
              <span className="text-sm text-muted">{t(label)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="latest-h">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="latest-h" className="text-2xl">
            {t('Latest order')}
          </h2>
          <Link
            to="/account/orders"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline underline-offset-4"
          >
            {t('All orders')} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {orders.isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : latest ? (
          <Link
            to={`/account/orders/${latest.id}`}
            className="flex items-center gap-4 rounded-[6px] border border-border bg-surface p-4 hover:border-fg"
          >
            <div className="flex -space-x-4">
              {latest.items.slice(0, 3).map((i) => (
                <ProductImage
                  key={i.id}
                  src={i.image_url}
                  alt=""
                  className="aspect-[4/5] w-14 rounded-[3px] border-2 border-surface"
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{latest.number}</p>
              <p className="text-[0.8125rem] text-muted">
                {formatDate(latest.created_at)} · {formatMoney(latest.totals.total)}
              </p>
            </div>
            <OrderStatusBadge status={latest.status} />
          </Link>
        ) : (
          <p className="rounded-[6px] border border-dashed border-border-strong p-6 text-center text-sm text-muted">
            {t('No orders yet.')}{' '}
            <Link to="/shop" className="font-medium text-fg underline underline-offset-4">
              {t('Start shopping')}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
