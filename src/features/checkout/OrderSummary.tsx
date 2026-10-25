import { ProductImage } from '@/components/ui/ProductImage';
import { useT } from '@/i18n';
import { formatMoney } from '@/lib/format';
import type { Totals } from '@/types';
import { TotalsTable } from '@/features/cart/CartSummary';

export interface SummaryLine {
  id: string;
  image: string;
  title: string;
  meta: string;
  quantity: number;
  total: number;
}

export function OrderSummary({
  lines,
  totals,
  couponCode,
  shippingLabel,
  taxLabel,
}: {
  lines: SummaryLine[];
  totals: Totals;
  couponCode?: string | null;
  shippingLabel?: string;
  taxLabel?: string;
}) {
  const { t } = useT();
  return (
    <div>
      <ul className="divide-y divide-border" aria-label={t('Items in your order')}>
        {lines.map((l) => (
          <li key={l.id} className="flex gap-3.5 py-3.5 first:pt-0">
            <div className="relative shrink-0">
              <ProductImage src={l.image} alt="" className="aspect-[4/5] w-16 rounded-[3px]" />
              <span
                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-fg text-[0.6875rem] font-medium text-bg"
                aria-hidden
              >
                {l.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="line-clamp-2 font-medium">{l.title}</p>
              <p className="text-[0.8125rem] text-muted">{l.meta}</p>
              <span className="sr-only">{t('Quantity {count}', { count: l.quantity })}</span>
            </div>
            <p className="text-sm tabular-nums">{formatMoney(l.total)}</p>
          </li>
        ))}
      </ul>
      <TotalsTable
        totals={totals}
        couponCode={couponCode}
        shippingLabel={shippingLabel}
        taxLabel={taxLabel}
        className="mt-3 border-t border-border pt-3"
      />
    </div>
  );
}
