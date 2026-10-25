import { Tag, Truck } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { amountToFreeShipping, getDeliveryOption } from '@/lib/pricing';
import type { Coupon, Totals } from '@/types';
import { useCartStore } from './cartStore';

export function FreeShippingBar({ subtotalAfterDiscount }: { subtotalAfterDiscount: number }) {
  const threshold = getDeliveryOption('standard').free_over ?? 0;
  const remaining = amountToFreeShipping(subtotalAfterDiscount);
  const pct = Math.min(100, Math.round((subtotalAfterDiscount / threshold) * 100));
  const { t } = useT();
  return (
    <div className="rounded-[4px] bg-subtle p-3.5 text-[0.8125rem]">
      <p className="flex items-center gap-2 font-medium">
        <Truck className="size-4" aria-hidden />
        {remaining === 0
          ? t("You've unlocked free standard shipping")
          : t('Add {amount} for free standard shipping', { amount: formatMoney(remaining) })}
      </p>
      <div
        role="progressbar"
        aria-label={t('Progress to free shipping')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-2.5 h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CouponForm({
  applied,
  error,
  checking,
}: {
  applied: Coupon | null;
  error: string | null;
  checking: boolean;
}) {
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const [value, setValue] = useState('');
  const { t, tm } = useT();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (code) {
      setCoupon(code);
      setValue('');
    }
  };

  if (couponCode && applied) {
    return (
      <div className="flex items-center justify-between rounded-[4px] border border-success/40 bg-success/10 px-3.5 py-3 text-sm">
        <p className="flex items-center gap-2 font-medium text-success">
          <Tag className="size-4" aria-hidden />
          {t('{code} applied', { code: applied.code })}
          <span className="font-normal opacity-80">· {tm(applied.description)}</span>
        </p>
        <Button
          variant="link"
          className="text-[0.8125rem]"
          onClick={() => setCoupon(null)}
          aria-label={t('Remove coupon {code}', { code: applied.code })}
        >
          {t('Remove')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={t('Apply coupon')} noValidate>
      <div className="flex items-end gap-2">
        <Input
          label={t('Coupon code')}
          name="coupon"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('Enter code')}
          wrapperClassName="flex-1"
          className="uppercase"
        />
        <Button type="submit" variant="outline" loading={checking} disabled={!value.trim()}>
          {t('Apply')}
        </Button>
      </div>
      {couponCode && error && (
        <p role="alert" className="text-xs font-medium text-sale">
          {tm(error)}{' '}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => setCoupon(null)}
          >
            {t('Clear')}
          </button>
        </p>
      )}
    </form>
  );
}

export function TotalsTable({
  totals,
  shippingLabel,
  taxLabel,
  couponCode,
  className,
  footer,
}: {
  totals: Totals;
  shippingLabel?: string;
  taxLabel?: string;
  couponCode?: string | null;
  className?: string;
  footer?: ReactNode;
}) {
  const row = 'flex justify-between py-1.5 text-sm';
  const { t } = useT();
  return (
    <dl className={cn('text-sm', className)}>
      <div className={row}>
        <dt className="text-muted">{t('Subtotal')}</dt>
        <dd className="tabular-nums" data-testid="subtotal">
          {formatMoney(totals.subtotal)}
        </dd>
      </div>
      {totals.savings > 0 && (
        <div className={row}>
          <dt className="text-muted">{t('Sale savings')}</dt>
          <dd className="tabular-nums text-sale">−{formatMoney(totals.savings)}</dd>
        </div>
      )}
      {totals.discount > 0 && (
        <div className={row}>
          <dt className="text-muted">
            {couponCode ? t('Discount ({code})', { code: couponCode }) : t('Discount')}
          </dt>
          <dd className="tabular-nums text-success" data-testid="discount">
            −{formatMoney(totals.discount)}
          </dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-muted">{shippingLabel ?? t('Shipping')}</dt>
        <dd className="tabular-nums" data-testid="shipping">
          {totals.shipping === 0 ? t('Free') : formatMoney(totals.shipping)}
        </dd>
      </div>
      <div className={row}>
        <dt className="text-muted">{taxLabel ?? t('Estimated tax')}</dt>
        <dd className="tabular-nums" data-testid="tax">
          {formatMoney(totals.tax)}
        </dd>
      </div>
      <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-medium">
        <dt>{t('Total')}</dt>
        <dd className="tabular-nums" data-testid="total">
          {formatMoney(totals.total)}
        </dd>
      </div>
      {footer}
    </dl>
  );
}
