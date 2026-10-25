import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ErrorState, Skeleton } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDateRange, formatMoney } from '@/lib/format';
import { DELIVERY_OPTIONS } from '@/lib/pricing';
import { api } from '@/services';
import type { DeliveryOption } from '@/types';

export function DeliveryStep({
  postalCode,
  subtotalAfterDiscount,
  freeShippingCoupon,
  value,
  onChange,
  onBack,
  onContinue,
}: {
  postalCode: string;
  subtotalAfterDiscount: number;
  freeShippingCoupon: boolean;
  value: DeliveryOption['id'];
  onChange: (id: DeliveryOption['id']) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t, tm } = useT();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['delivery-check', postalCode],
    queryFn: () => api.checkout.checkDelivery(postalCode),
  });

  if (isLoading) return <Skeleton className="h-52 w-full" />;
  if (isError)
    return (
      <ErrorState
        title={t('Couldn’t check delivery')}
        onRetry={() => void refetch()}
        className="py-6"
      />
    );
  if (!data?.serviceable) {
    return (
      <div role="alert" className="rounded-[6px] border border-sale/40 bg-sale/10 p-5">
        <p className="font-medium text-sale">
          {t('We can’t deliver to {postalCode} yet.', { postalCode })}
        </p>
        <p className="mt-1 text-sm text-sale/90">{data?.message ? tm(data.message) : null}</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          {t('Change address')}
        </Button>
      </div>
    );
  }

  const priceFor = (o: DeliveryOption) =>
    freeShippingCoupon || (o.free_over !== null && subtotalAfterDiscount >= o.free_over)
      ? 0
      : o.price;

  return (
    <div className="space-y-6">
      <section aria-labelledby="delivery-h">
        <h2 id="delivery-h" className="mb-4 text-2xl">
          {t('Delivery method')}
        </h2>
        <div role="radiogroup" aria-label={t('Delivery method')} className="space-y-3">
          {DELIVERY_OPTIONS.map((o) => {
            const slot = data.options.find((x) => x.id === o.id);
            const price = priceFor(o);
            return (
              <label key={o.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  className="peer sr-only"
                  checked={value === o.id}
                  onChange={() => onChange(o.id)}
                />
                <span
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-[6px] border p-4 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--ring)]',
                    value === o.id
                      ? 'border-fg ring-1 ring-fg'
                      : 'border-border hover:border-border-strong',
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{t(o.label)}</span>
                    {slot && (
                      <span className="block text-[0.8125rem] text-muted">
                        {t('Arrives {dates}', { dates: formatDateRange(slot.from, slot.to) })}
                      </span>
                    )}
                    <span className="block text-xs text-muted">{t(o.description)}</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {price === 0 ? t('Free') : formatMoney(price)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack}>
          {t('Back')}
        </Button>
        <Button size="lg" block onClick={onContinue}>
          {t('Continue to payment')}
        </Button>
      </div>
    </div>
  );
}
