import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/ui/ProductImage';
import { Price, QuantitySelector } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { MAX_QTY_PER_LINE } from '@/lib/pricing';
import type { ResolvedLine } from './hooks';
import { toast } from '@/store/uiStore';
import { useCartStore } from './cartStore';

export function CartLineItem({
  item,
  compact = false,
  onNavigate,
}: {
  item: ResolvedLine;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { line, product, variant } = item;
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const toggleSaved = useCartStore((s) => s.toggleSaved);
  const acknowledge = useCartStore((s) => s.acknowledgePrice);
  const { t } = useT();

  if (!product || !variant) {
    return (
      <li className="flex items-center justify-between gap-3 py-5" data-testid="cart-line">
        <p className="text-sm text-muted">{t('This item is no longer available.')}</p>
        <Button variant="ghost" size="sm" onClick={() => remove(line.variantId)}>
          {t('Remove')}
        </Button>
      </li>
    );
  }

  const max = Math.min(item.stock, MAX_QTY_PER_LINE);
  const href = `/product/${product.slug}`;
  const imgSize = compact ? 'w-20' : 'w-24 sm:w-32';

  return (
    <li className={cn('flex gap-4 py-5', item.unavailable && 'opacity-80')} data-testid="cart-line">
      <Link
        to={href}
        onClick={onNavigate}
        className={cn('shrink-0', imgSize)}
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage
          src={variant.image_urls[0] ?? ''}
          alt=""
          className="aspect-[4/5] w-full rounded-[3px]"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={href}
              onClick={onNavigate}
              className="line-clamp-2 text-sm font-medium hover:underline underline-offset-4"
            >
              {product.title}
            </Link>
            <p className="mt-0.5 text-[0.8125rem] text-muted">
              {t('{color} · Size {size}', { color: t(variant.color), size: variant.size })}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            <Price price={item.unitPrice * item.effectiveQty} size="sm" />
            {item.effectiveQty > 1 && (
              <p className="text-xs text-muted">
                {t('{price} each', { price: formatMoney(item.unitPrice) })}
              </p>
            )}
          </div>
        </div>

        {item.unavailable && (
          <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-sale">
            {line.savedForLater
              ? t('This item is currently sold out.')
              : t('This item is sold out. Remove it or save it for later to continue.')}
          </p>
        )}
        {item.overStock && (
          <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-warning">
            {t('Only {count} left — quantity adjusted.', { count: item.stock })}
          </p>
        )}
        {item.priceChanged && !item.unavailable && (
          <p role="status" className="mt-2 text-[0.8125rem] text-warning">
            {t('Price changed from {from} to {to}.', {
              from: formatMoney(line.addedPrice),
              to: formatMoney(item.unitPrice),
            })}{' '}
            <button
              type="button"
              className="font-medium underline underline-offset-4"
              onClick={() => acknowledge(line.variantId, item.unitPrice)}
            >
              {t('Got it')}
            </button>
          </p>
        )}
        {!item.unavailable && item.stock > 0 && item.stock <= 3 && !item.overStock && (
          <p className="mt-2 text-[0.8125rem] text-warning">
            {t('Only {count} left', { count: item.stock })}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-3">
          {!line.savedForLater && !item.unavailable ? (
            <QuantitySelector
              size="sm"
              value={item.effectiveQty}
              max={max}
              label={t('Quantity for {title}', { title: product.title })}
              onChange={(q) => setQuantity(line.variantId, q, item.stock)}
            />
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-x-1 text-[0.8125rem]">
            <Button
              variant="link"
              className="px-1 py-2 text-[0.8125rem] text-muted"
              onClick={() => {
                toggleSaved(line.variantId);
                toast.info(
                  line.savedForLater ? t('Moved back to your bag') : t('Saved for later'),
                  line.savedForLater
                    ? product.title
                    : t('{title} is in “Saved for later” below.', { title: product.title }),
                );
              }}
            >
              {line.savedForLater ? t('Move to bag') : t('Save for later')}
            </Button>
            <span aria-hidden className="text-border-strong">
              |
            </span>
            <Button
              variant="link"
              className="px-1 py-2 text-[0.8125rem] text-muted"
              onClick={() => remove(line.variantId)}
              aria-label={t('Remove {title} from cart', { title: product.title })}
            >
              {t('Remove')}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
