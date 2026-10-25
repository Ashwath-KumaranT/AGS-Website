import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { InlineAlert, Skeleton } from '@/components/ui/primitives';
import { useAuthStore } from '@/features/auth/authStore';
import { CouponForm } from '@/features/cart/CartSummary';
import { useCartStore } from '@/features/cart/cartStore';
import { useCartDetails } from '@/features/cart/hooks';
import { AddressStep } from '@/features/checkout/AddressStep';
import { DeliveryStep } from '@/features/checkout/DeliveryStep';
import { OrderSummary, type SummaryLine } from '@/features/checkout/OrderSummary';
import { PaymentForm } from '@/features/checkout/PaymentForm';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { getDeliveryOption } from '@/lib/pricing';
import { parseExpiry, type PaymentValues } from '@/lib/validation';
import { api, isApiError } from '@/services';
import { toast } from '@/store/uiStore';
import type { AddressInput, DeliveryOption, Order } from '@/types';

const STEPS = ['Address', 'Delivery', 'Payment'] as const;

/** English summary label per delivery option (translated at display). */
const SHIPPING_LABELS: Record<DeliveryOption['id'], string> = {
  standard: 'Shipping (standard)',
  express: 'Shipping (express)',
  next_day: 'Shipping (next-day)',
};

function Progress({ step, onGo }: { step: number; onGo: (n: number) => void }) {
  const { t } = useT();
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm" aria-label={t('Checkout progress')}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={current ? 'step' : undefined}
          >
            <button
              type="button"
              disabled={!done}
              onClick={() => onGo(n)}
              className={cn(
                'flex items-center gap-2 rounded-full py-1 pr-3 transition-colors',
                done && 'hover:text-accent',
                !done && !current && 'text-muted',
              )}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
                  current && 'border-fg bg-fg text-bg',
                  done && 'border-success bg-success text-white',
                  !done && !current && 'border-border-strong',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : n}
              </span>
              <span className={cn('hidden sm:inline', current && 'font-medium')}>{t(label)}</span>
              {done && <span className="sr-only"> ({t('completed')})</span>}
            </button>
            {n < STEPS.length && <span aria-hidden className="h-px w-6 bg-border-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Waits for the payment webhook to flip the order out of pending_payment. */
async function waitForOrder(id: string, tries = 12): Promise<Order | null> {
  for (let i = 0; i < tries; i += 1) {
    const order = await api.orders.getOrder(id);
    if (order && order.status !== 'pending_payment') return order;
    await new Promise((r) => setTimeout(r, 500));
  }
  return api.orders.getOrder(id);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t, tm } = useT();
  const user = useAuthStore((s) => s.user);
  const cart = useCartDetails();
  const clearCart = useCartStore((s) => s.clear);
  const couponCode = useCartStore((s) => s.couponCode);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [deliveryId, setDeliveryId] = useState<DeliveryOption['id']>('standard');
  const [processing, setProcessing] = useState<null | 'creating' | 'paying' | 'confirming'>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pendingOrderId = useRef<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const quoteLines = useMemo(
    () => cart.purchasable.map((r) => ({ variantId: r.line.variantId, quantity: r.effectiveQty })),
    [cart.purchasable],
  );

  const quote = useQuery({
    queryKey: ['quote', quoteLines, couponCode, deliveryId],
    queryFn: () => api.checkout.quote({ lines: quoteLines, couponCode, deliveryId }),
    enabled: quoteLines.length > 0,
    placeholderData: (prev) => prev,
  });

  // A half-finished order is priced for the bag it was created from. If the bag, coupon or
  // delivery option changes, retrying it would charge the old total — start a fresh order.
  useEffect(() => {
    pendingOrderId.current = null;
  }, [quoteLines, couponCode, deliveryId]);

  const summaryLines: SummaryLine[] = useMemo(
    () =>
      (quote.data?.lines ?? []).flatMap((l) => {
        const r = cart.resolved.find((x) => x.line.variantId === l.variantId);
        if (!r?.product || !r.variant) return [];
        return [
          {
            id: l.variantId,
            image: r.variant.image_urls[0] ?? '',
            title: r.product.title,
            meta: `${t(r.variant.color)} · ${r.variant.size}`,
            quantity: l.quantity,
            total: l.unit_price * l.quantity,
          },
        ];
      }),
    [quote.data, cart.resolved, t],
  );

  if (completed) return null;
  if (!cart.isLoading && cart.purchasable.length === 0) return <Navigate to="/cart" replace />;

  const totals = quote.data?.totals ?? cart.totals;
  const blockingIssues = (quote.data?.issues ?? []).filter((i) => i.code !== 'price_changed');
  const subtotalAfterDiscount = totals.subtotal - totals.discount;

  const goStep = (n: number) => {
    // editing earlier steps invalidates any half-finished order
    if (n < step) pendingOrderId.current = null;
    setPayError(null);
    setStep(n);
  };

  const pay = async (card: PaymentValues | null) => {
    if (!address || !quote.data) return;
    setPayError(null);
    setNotice(null);
    if (!navigator.onLine) {
      setPayError(
        t('You appear to be offline. Reconnect and try again — you have not been charged.'),
      );
      return;
    }
    try {
      setProcessing('creating');
      const result = pendingOrderId.current
        ? await api.checkout.retryPayment(pendingOrderId.current)
        : await api.checkout.createOrder({
            lines: quoteLines,
            couponCode,
            deliveryId,
            contactEmail: email,
            address,
            expectedTotal: quote.data.totals.total,
          });
      pendingOrderId.current = result.order.id;

      setProcessing('paying');
      const exp = card ? parseExpiry(card.expiry) : null;
      const outcome = await api.payments.confirm(
        result.intent,
        card && exp
          ? {
              number: card.number,
              name: card.name,
              cvc: card.cvc,
              exp_month: exp.month,
              exp_year: exp.year,
            }
          : undefined,
      );

      if (outcome.status === 'redirect') {
        window.location.assign(outcome.url);
        return;
      }
      if (outcome.status === 'failed') {
        setPayError(
          t('{reason} You have not been charged. Try another card or retry.', {
            reason: tm(outcome.message),
          }),
        );
        await qc.invalidateQueries({ queryKey: ['products'] });
        return;
      }

      setProcessing('confirming');
      const order = await waitForOrder(result.order.id);
      if (order?.status === 'payment_failed') {
        setPayError(
          t('{reason} You have not been charged.', {
            reason: order.payment.failure_reason
              ? tm(order.payment.failure_reason)
              : t('Payment failed.'),
          }),
        );
        return;
      }
      if (!order || order.status === 'pending_payment') {
        // payment taken but webhook delayed — send them to the order page which keeps polling
        setCompleted(true);
        navigate(`/order-confirmation/${result.order.id}`, { replace: true });
        return;
      }
      setCompleted(true);
      clearCart();
      pendingOrderId.current = null;
      await qc.invalidateQueries({ queryKey: qk.orders });
      await qc.invalidateQueries({ queryKey: ['products-by-ids'] });
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (e) {
      if (isApiError(e)) {
        // the order exists but we never got a payment session — reuse it instead of
        // creating a second order that reserves the same stock again
        const orphan = (e.details as { orderId?: string } | undefined)?.orderId;
        if (orphan) pendingOrderId.current = orphan;
        if (e.code === 'PRICE_CHANGED') {
          await quote.refetch();
          await qc.invalidateQueries({ queryKey: ['products-by-ids'] });
          setNotice(
            t(
              'Prices changed while you were checking out. Please review your updated total and place your order again.',
            ),
          );
        } else if (e.code === 'OUT_OF_STOCK') {
          await qc.invalidateQueries({ queryKey: ['products-by-ids'] });
          setPayError(t('{message} Please update your bag.', { message: tm(e.message) }));
        } else if (e.code === 'AUTH_REQUIRED') {
          toast.error(t('Session expired'), t('Please sign in again to finish your order.'));
          navigate('/sign-in', { state: { from: '/checkout' } });
        } else {
          setPayError(tm(e.message));
        }
      } else {
        setPayError(
          t(
            'We couldn’t reach the server. Check your connection and try again — you have not been charged.',
          ),
        );
      }
    } finally {
      setProcessing(null);
    }
  };

  const summary = (
    <div className="space-y-5">
      {quote.isLoading || cart.isLoading ? (
        <div className="space-y-3" role="status" aria-label={t('Loading order summary')}>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          <OrderSummary
            lines={summaryLines}
            totals={totals}
            couponCode={quote.data?.coupon?.code}
            shippingLabel={t(SHIPPING_LABELS[deliveryId])}
          />
          <CouponForm
            applied={quote.data?.coupon ?? cart.coupon}
            error={
              cart.couponError ??
              quote.data?.issues.find((i) => i.code === 'coupon_invalid')?.message ??
              null
            }
            checking={cart.couponChecking}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="container-page py-6 md:py-10">
      <Seo title={t('Checkout')} noindex />
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/cart"
          className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          ← {t('Back to bag')}
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Lock className="size-4" aria-hidden /> {t('Secure checkout')}
        </p>
      </div>

      {/* Mobile summary toggle */}
      <details className="group mb-6 rounded-[6px] border border-border bg-surface lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            {t('Order summary')}{' '}
            <ChevronDown
              className="size-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </span>
          <span className="tabular-nums">{formatMoney(totals.total)}</span>
        </summary>
        <div className="border-t border-border p-4">{summary}</div>
      </details>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_26.25rem] xl:gap-16">
        <div>
          <h1 className="sr-only">{t('Checkout')}</h1>
          <Progress step={step} onGo={goStep} />

          {blockingIssues.length > 0 && (
            <InlineAlert tone="error" className="mb-6">
              <p className="font-medium">{t('There’s a problem with your bag')}</p>
              <ul className="mt-1 list-disc pl-5">
                {blockingIssues.map((i) => (
                  <li key={i.message}>{tm(i.message)}</li>
                ))}
              </ul>
              <Link
                to="/cart"
                className="mt-2 inline-block font-medium underline underline-offset-4"
              >
                {t('Review your bag')}
              </Link>
            </InlineAlert>
          )}
          {notice && (
            <InlineAlert tone="warning" className="mb-6">
              {tm(notice)}
            </InlineAlert>
          )}

          {step === 1 && (
            <AddressStep
              initialEmail={email}
              initial={address}
              onDone={(r) => {
                setEmail(r.email);
                setAddress(r.address);
                setStep(2);
              }}
            />
          )}

          {step === 2 && address && (
            <DeliveryStep
              postalCode={address.postal_code}
              subtotalAfterDiscount={subtotalAfterDiscount}
              freeShippingCoupon={quote.data?.coupon?.type === 'free_shipping'}
              value={deliveryId}
              onChange={setDeliveryId}
              onBack={() => goStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 3 && address && (
            <div className="space-y-6">
              <section
                aria-labelledby="review-h"
                className="rounded-[6px] border border-border p-4 text-sm"
              >
                <h2 id="review-h" className="sr-only">
                  {t('Order details')}
                </h2>
                <dl className="divide-y divide-border">
                  <div className="flex justify-between gap-4 pb-3">
                    <dt className="text-muted">{t('Contact')}</dt>
                    <dd className="text-right">{email}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">{t('Ship to')}</dt>
                    <dd className="text-right">
                      {address.name}, {address.line1}, {address.city} {address.postal_code}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-3">
                    <dt className="text-muted">{t('Delivery')}</dt>
                    <dd className="text-right">{t(getDeliveryOption(deliveryId).label)}</dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="pay-h">
                <h2 id="pay-h" className="mb-4 text-2xl">
                  {t('Payment')}
                </h2>
                <PaymentForm
                  mode={api.payments.mode}
                  total={totals.total}
                  loading={processing !== null}
                  error={payError}
                  onSubmit={(v) => void pay(v)}
                />
              </section>
              <Button variant="ghost" onClick={() => goStep(2)}>
                ← {t('Back to delivery')}
              </Button>
            </div>
          )}
        </div>

        <aside
          aria-label="Order summary"
          className="hidden rounded-[6px] border border-border bg-surface p-6 lg:sticky lg:top-8 lg:block"
        >
          <h2 className="mb-5 text-2xl">{t('Order summary')}</h2>
          {summary}
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
            {t('Totals are re-verified on our servers before you’re charged.')}
          </p>
        </aside>
      </div>

      {processing && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={t('Processing payment')}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-bg/85 backdrop-blur-sm"
        >
          <div className="text-center" role="status">
            <div
              className="mx-auto mb-5 size-10 animate-spin rounded-full border-2 border-border-strong border-t-fg"
              aria-hidden
            />
            <p className="font-display text-2xl">
              {processing === 'creating'
                ? t('Securing your order…')
                : processing === 'paying'
                  ? t('Processing payment…')
                  : t('Confirming your payment…')}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t('Please don’t close or refresh this page.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
