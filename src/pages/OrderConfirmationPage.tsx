import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { AddressCard } from '@/features/account/AddressCard';
import { useCartStore } from '@/features/cart/cartStore';
import { OrderSummary } from '@/features/checkout/OrderSummary';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { formatDateRange } from '@/lib/format';
import { getDeliveryOption } from '@/lib/pricing';
import { api } from '@/services';

/** How long to wait for the payment webhook before telling the shopper it is taking a while. */
const WEBHOOK_WAIT_MS = 60_000;

export default function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const { t, tm } = useT();
  const qc = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);
  const startedAt = useRef(Date.now());
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  const settled = useRef(false);
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: qk.order(id),
    queryFn: () => api.orders.getOrder(id),
    // keep polling until the payment webhook has settled the order, but don't poll forever:
    // a webhook that never arrives would otherwise keep the page requesting indefinitely
    refetchInterval: (q) =>
      q.state.data?.status === 'pending_payment' && Date.now() - startedAt.current < WEBHOOK_WAIT_MS
        ? 1500
        : false,
  });

  const pending = order?.status === 'pending_payment';

  useEffect(() => {
    if (!pending) return;
    const remaining = Math.max(0, WEBHOOK_WAIT_MS - (Date.now() - startedAt.current));
    const timer = setTimeout(() => setWaitedTooLong(true), remaining);
    return () => clearTimeout(timer);
  }, [pending]);

  // the bag survives a redirect to the payment provider and a slow webhook, so it is
  // emptied here rather than in checkout — this page is where every paid order lands
  useEffect(() => {
    if (!order || settled.current) return;
    if (order.status === 'pending_payment' || order.status === 'payment_failed') return;
    settled.current = true;
    clearCart();
    void qc.invalidateQueries({ queryKey: qk.orders });
    void qc.invalidateQueries({ queryKey: ['products-by-ids'] });
  }, [order, clearCart, qc]);

  if (isLoading) {
    return (
      <div
        className="container-page max-w-3xl py-14"
        role="status"
        aria-label={t('Loading your order')}
      >
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-10 w-2/3" />
        <Skeleton className="mt-10 h-64 w-full" />
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!order) {
    return (
      <EmptyState
        title={t('Order not found')}
        description={t('We couldn’t find that order in your account.')}
        action={{ label: t('View my orders'), to: '/account/orders' }}
      />
    );
  }

  const delivery = getDeliveryOption(order.delivery_option);
  const lines = order.items.map((i) => ({
    id: i.id,
    image: i.image_url,
    title: t(i.title),
    meta: `${t(i.color)} · ${i.size}`,
    quantity: i.quantity,
    total: i.line_total,
  }));

  if (order.status === 'pending_payment') {
    return (
      <div className="container-page max-w-xl py-20 text-center" role="status">
        <Seo title={t('Confirming payment')} noindex />
        <Clock className="mx-auto size-14 text-warning" aria-hidden />
        <h1 className="mt-6 text-4xl">{t('Confirming your payment…')}</h1>
        {waitedTooLong ? (
          <>
            <p className="mt-3 text-muted">
              {t(
                'This is taking longer than usual. Your payment is safe — if it went through, the order will appear in your account shortly.',
              )}
            </p>
            <ButtonLink to="/account/orders" size="lg" className="mt-8">
              {t('View my orders')}
            </ButtonLink>
          </>
        ) : (
          <p className="mt-3 text-muted">
            {t(
              'We’re waiting for confirmation from your bank. This usually takes a few seconds — you can safely stay on this page.',
            )}
          </p>
        )}
      </div>
    );
  }

  if (order.status === 'payment_failed') {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <Seo title={t('Payment failed')} noindex />
        <XCircle className="mx-auto size-14 text-sale" aria-hidden />
        <h1 className="mt-6 text-4xl">{t('Payment didn’t go through')}</h1>
        <p className="mt-3 text-muted">
          {t('{reason} You have not been charged.', {
            reason: order.payment.failure_reason
              ? tm(order.payment.failure_reason)
              : t('Your payment could not be completed.'),
          })}
        </p>
        <ButtonLink to="/checkout" size="lg" className="mt-8">
          {t('Try again')}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page max-w-5xl py-10 md:py-16">
      <Seo title={t('Order {number} confirmed', { number: order.number })} noindex />
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
        <p className="eyebrow mt-6">{t('Thank you')}</p>
        <h1 className="mt-2 text-4xl md:text-5xl">{t('Your order is confirmed')}</h1>
        <p className="mt-3 text-muted">
          {t('Order')}{' '}
          <strong className="text-fg" data-testid="order-number">
            {order.number}
          </strong>{' '}
          · {t('A confirmation has been sent to {email}.', { email: order.contact_email })}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink to={`/account/orders/${order.id}/track`} size="lg">
            {t('Track order')}
          </ButtonLink>
          <ButtonLink to="/shop" size="lg" variant="outline">
            {t('Continue shopping')}
          </ButtonLink>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_23.75rem]">
        <section
          aria-labelledby="items-h"
          className="rounded-[6px] border border-border p-5 md:p-6"
        >
          <h2 id="items-h" className="mb-4 text-2xl">
            {t('Items')}
          </h2>
          <OrderSummary lines={lines} totals={order.totals} couponCode={order.coupon_code} />
        </section>
        <div className="space-y-5">
          <section aria-labelledby="delivery-h" className="rounded-[6px] border border-border p-5">
            <h2 id="delivery-h" className="mb-2 text-xl">
              {t('Delivery')}
            </h2>
            <p className="text-sm font-medium">{t(delivery.label)}</p>
            <p className="mb-4 text-sm text-muted">
              {t('Estimated {dates}', {
                dates: formatDateRange(order.estimated_delivery.from, order.estimated_delivery.to),
              })}
            </p>
            <AddressCard address={order.shipping_address} className="border-0 bg-subtle" />
          </section>
          <section
            aria-labelledby="payment-h"
            className="rounded-[6px] border border-border p-5 text-sm"
          >
            <h2 id="payment-h" className="mb-2 text-xl">
              {t('Payment')}
            </h2>
            <p>
              {order.payment.brand ?? t('Card')}{' '}
              {order.payment.last4 && `•••• ${order.payment.last4}`}
            </p>
            <p className="text-muted">{t('Paid in full')}</p>
          </section>
          <p className="text-center text-sm text-muted">
            {t('Questions? Visit your')}{' '}
            <Link to="/account/orders" className="font-medium text-fg underline underline-offset-4">
              {t('orders')}
            </Link>{' '}
            {t('any time.')}
          </p>
        </div>
      </div>
    </div>
  );
}
