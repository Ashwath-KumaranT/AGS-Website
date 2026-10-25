import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Overlay';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  InlineAlert,
  Skeleton,
} from '@/components/ui/primitives';
import { AddressCard } from '@/features/account/AddressCard';
import { TotalsTable } from '@/features/cart/CartSummary';
import { useAddToCart } from '@/features/cart/hooks';
import { OrderStatusBadge, TrackingTimeline } from '@/features/orders/components';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { formatDate, formatDateRange, formatMoney } from '@/lib/format';
import { getDeliveryOption } from '@/lib/pricing';
import { returnWindow } from '@/lib/returns';
import { returnSchema, type ReturnValues } from '@/lib/validation';
import { api } from '@/services';
import { toast } from '@/store/uiStore';
import type { Order } from '@/types';

const REASONS: { value: ReturnValues['reason']; label: string }[] = [
  { value: 'too_small', label: 'Too small' },
  { value: 'too_large', label: 'Too large' },
  { value: 'defective', label: 'Damaged or defective' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
];

function ReturnDialog({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const { t, tm } = useT();
  const qc = useQueryClient();
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [itemsError, setItemsError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReturnValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: { type: 'refund', reason: 'too_small', note: '' },
  });
  const mutation = useMutation({
    mutationFn: (v: ReturnValues) => api.orders.requestReturn({ orderId: order.id, itemIds, ...v }),
    onSuccess: async () => {
      toast.success('Return requested', 'We’ll email you a prepaid label within 24 hours.');
      await qc.invalidateQueries({ queryKey: qk.returns });
      // the order carries the returns already raised against it, so refresh it too —
      // otherwise the page keeps offering a return for items that now have one
      await qc.invalidateQueries({ queryKey: qk.order(order.id) });
      onClose();
    },
    onError: (e) =>
      toast.error('Could not request return', e instanceof Error ? e.message : undefined),
  });

  const submit = handleSubmit((v) => {
    if (itemIds.length === 0) {
      setItemsError('Select at least one item.');
      return;
    }
    mutation.mutate(v);
  });

  return (
    <Modal open={open} onClose={onClose} title={t('Request a return')}>
      <form onSubmit={submit} className="space-y-5 p-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-[0.8125rem] font-medium">{t('Which items?')}</legend>
          {order.items.map((i) => (
            <Checkbox
              key={i.id}
              label={t('{title} — {color}, {size} (×{quantity})', {
                title: t(i.title),
                color: t(i.color),
                size: i.size,
                quantity: i.quantity,
              })}
              checked={itemIds.includes(i.id)}
              onChange={(e) => {
                setItemsError('');
                setItemIds((ids) =>
                  e.target.checked ? [...ids, i.id] : ids.filter((x) => x !== i.id),
                );
              }}
            />
          ))}
          {itemsError && (
            <p role="alert" className="text-xs font-medium text-sale">
              {tm(itemsError)}
            </p>
          )}
        </fieldset>
        <Select label={t('I’d like a')} {...register('type')}>
          <option value="refund">{t('Refund to original payment')}</option>
          <option value="return">{t('Exchange / store credit')}</option>
        </Select>
        <Select label={t('Reason')} {...register('reason')}>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {t(r.label)}
            </option>
          ))}
        </Select>
        <Textarea
          label={t('Anything else? (optional)')}
          error={errors.note?.message}
          {...register('note')}
        />
        <Button type="submit" block loading={mutation.isPending}>
          {t('Submit request')}
        </Button>
      </form>
    </Modal>
  );
}

export default function OrderDetailPage() {
  const { t } = useT();
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const [returnOpen, setReturnOpen] = useState(false);
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: qk.order(id), queryFn: () => api.orders.getOrder(id) });

  const cancel = useMutation({
    mutationFn: () => api.orders.cancelOrder(id),
    onSuccess: (o) => {
      qc.setQueryData(qk.order(id), o);
      void qc.invalidateQueries({ queryKey: qk.orders });
      toast.success('Order cancelled', 'Your refund has been issued.');
    },
    onError: (e) => toast.error('Could not cancel', e instanceof Error ? e.message : undefined),
  });

  const reorder = useMutation({
    mutationFn: async (o: Order) => {
      const products = await api.catalog.getProductsByIds(o.items.map((i) => i.product_id));
      let added = 0;
      o.items.forEach((i) => {
        const p = products.find((x) => x.id === i.product_id);
        const v = p?.variants.find((x) => x.id === i.variant_id);
        if (p && v && v.inventory_count > 0 && addToCart(p, v, i.quantity, { openDrawer: false }))
          added += 1;
      });
      return { added, total: o.items.length };
    },
    onSuccess: ({ added, total }) => {
      if (added === 0)
        toast.error('Items unavailable', 'None of these items are in stock right now.');
      else
        toast.success(
          'Added to bag',
          added < total ? `${added} of ${total} items were available.` : undefined,
          { label: t('View bag'), to: '/cart' },
        );
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!order)
    return (
      <EmptyState
        title={t('Order not found')}
        action={{ label: t('Back to orders'), to: '/account/orders' }}
      />
    );

  const canCancel = order.status === 'paid' || order.status === 'processing';
  const returns = returnWindow(order);
  const canReturn = returns.open;

  return (
    <div>
      <Seo title={t('Order {number}', { number: order.number })} noindex />
      <Breadcrumbs
        items={[{ label: t('Orders'), to: '/account/orders' }, { label: order.number }]}
      />
      <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl">{t('Order {number}', { number: order.number })}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('Placed {date}', { date: formatDate(order.created_at) })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status === 'payment_failed' && (
        <InlineAlert tone="error" className="mb-6">
          {t(
            'Payment for this order failed and you were not charged. Items were returned to stock.',
          )}
        </InlineAlert>
      )}

      {returns.deadline && (
        <p className="mb-4 text-sm text-muted" data-testid="return-window">
          {returns.open
            ? t('Free returns until {date} (7 days after delivery).', {
                date: formatDate(returns.deadline.toISOString()),
              })
            : t('The 7-day return window for this order closed on {date}.', {
                date: formatDate(returns.deadline.toISOString()),
              })}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {order.shipment && order.status !== 'cancelled' && (
          <ButtonLink to={`/account/orders/${order.id}/track`}>{t('Track shipment')}</ButtonLink>
        )}
        <Button variant="outline" onClick={() => reorder.mutate(order)} loading={reorder.isPending}>
          {t('Buy again')}
        </Button>
        {canReturn && (
          <Button variant="outline" onClick={() => setReturnOpen(true)}>
            {t('Return or refund')}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="ghost"
            loading={cancel.isPending}
            onClick={() => {
              if (window.confirm(t('Cancel this order? You’ll receive a full refund.')))
                cancel.mutate();
            }}
          >
            {t('Cancel order')}
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() =>
            toast.info('We’re here to help', 'Email care@asg.example or call +1 800 555 0199.')
          }
        >
          {t('Contact support')}
        </Button>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_21.25rem]">
        <section aria-labelledby="items-h">
          <h2 id="items-h" className="mb-2 text-2xl">
            {t('Items')}
          </h2>
          <ul className="divide-y divide-border border-y border-border">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <Link to={`/product/${i.slug}`} className="shrink-0" tabIndex={-1} aria-hidden>
                  <ProductImage
                    src={i.image_url}
                    alt=""
                    className="aspect-[4/5] w-20 rounded-[3px]"
                  />
                </Link>
                <div className="min-w-0 flex-1 text-sm">
                  <Link
                    to={`/product/${i.slug}`}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {t(i.title)}
                  </Link>
                  <p className="text-muted">
                    {t(i.color)} · {i.size} · {t('Qty {quantity}', { quantity: i.quantity })}
                  </p>
                  {order.status === 'delivered' && !i.reviewed && (
                    <Link
                      to={`/product/${i.slug}#reviews`}
                      className="mt-2 inline-block text-[0.8125rem] font-medium underline underline-offset-4"
                    >
                      {t('Write a review')}
                    </Link>
                  )}
                </div>
                <p className="text-sm tabular-nums">{formatMoney(i.line_total)}</p>
              </li>
            ))}
          </ul>
          <TotalsTable
            totals={order.totals}
            couponCode={order.coupon_code}
            taxLabel={t('Tax')}
            className="mt-4 max-w-sm sm:ml-auto"
          />
        </section>

        <div className="space-y-5">
          {order.shipment && order.status !== 'payment_failed' && (
            <section
              className="rounded-[6px] border border-border p-5"
              aria-labelledby="progress-h"
            >
              <h2 id="progress-h" className="mb-4 text-xl">
                {t('Progress')}
              </h2>
              <TrackingTimeline order={order} />
            </section>
          )}
          <section
            className="rounded-[6px] border border-border p-5 text-sm"
            aria-labelledby="ship-h"
          >
            <h2 id="ship-h" className="mb-2 text-xl">
              {t('Delivery')}
            </h2>
            <p className="font-medium">{t(getDeliveryOption(order.delivery_option).label)}</p>
            <p className="mb-3 text-muted">
              {t('Est. {range}', {
                range: formatDateRange(order.estimated_delivery.from, order.estimated_delivery.to),
              })}
            </p>
            <AddressCard address={order.shipping_address} className="border-0 bg-subtle" />
          </section>
          <section
            className="rounded-[6px] border border-border p-5 text-sm"
            aria-labelledby="pay-h"
          >
            <h2 id="pay-h" className="mb-2 text-xl">
              {t('Payment')}
            </h2>
            <p>
              {order.payment.brand ?? t('Card')}{' '}
              {order.payment.last4 ? `•••• ${order.payment.last4}` : ''}
            </p>
            <p className="capitalize text-muted">{t(order.payment.status.replace('_', ' '))}</p>
          </section>
        </div>
      </div>

      {/* mounted only while open so the selection and form start empty each time */}
      {returnOpen && (
        <ReturnDialog order={order} open onClose={() => setReturnOpen(false)} />
      )}
    </div>
  );
}
