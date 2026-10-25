import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/ui/ProductImage';
import { Badge, Price, Rating, Skeleton } from '@/components/ui/primitives';
import { useAddToCart } from '@/features/cart/hooks';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { percentOff } from '@/lib/format';
import type { ProductWithVariants } from '@/types';
import { ColorDots } from './ColorSwatches';
import { firstAvailableColor, getSwatches, isSoldOut, variantsForColor } from './utils';

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithVariants;
  priority?: boolean;
}) {
  const [color, setColor] = useState(() => firstAvailableColor(product));
  const [quickOpen, setQuickOpen] = useState(false);
  const addToCart = useAddToCart();
  const { t } = useT();

  const swatches = getSwatches(product);
  const variants = variantsForColor(product, color);
  const images = variants[0]?.image_urls ?? [];
  const soldOut = isSoldOut(product);
  const pct = percentOff(product.price, product.compare_at_price);
  const href = `/product/${product.slug}`;

  return (
    <article className="group relative" data-testid="product-card">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-subtle">
        <Link to={href} className="block size-full" tabIndex={-1} aria-hidden>
          <ProductImage
            src={images[0] ?? ''}
            alt={t('{title} in {color}', { title: product.title, color: t(color) })}
            priority={priority}
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              images[1] && 'group-hover:opacity-0',
            )}
          />
          {images[1] && (
            <ProductImage
              src={images[1]}
              alt=""
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {soldOut ? (
            <Badge tone="dark">{t('Sold out')}</Badge>
          ) : (
            <>
              {product.is_new && <Badge tone="dark">{t('New')}</Badge>}
              {pct > 0 && <Badge tone="sale">−{pct}%</Badge>}
            </>
          )}
        </div>

        <WishlistButton
          productId={product.id}
          title={product.title}
          className="absolute right-2 top-2"
        />

        {!soldOut && (
          <>
            <button
              type="button"
              onClick={() => setQuickOpen((o) => !o)}
              aria-expanded={quickOpen}
              aria-label={
                quickOpen ? t('Close quick add') : t('Quick add {title}', { title: product.title })
              }
              className={cn(
                'absolute bottom-2 right-2 inline-flex size-11 items-center justify-center rounded-full bg-bg/90 text-fg shadow-soft backdrop-blur transition-opacity hover:bg-bg',
                'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
                quickOpen && 'md:opacity-100',
              )}
            >
              {quickOpen ? (
                <X className="size-[1.125rem]" aria-hidden />
              ) : (
                <Plus className="size-[1.125rem]" aria-hidden />
              )}
            </button>

            {quickOpen && (
              <div className="animate-slide-up absolute inset-x-0 bottom-0 z-10 bg-bg/95 p-3 pr-16 backdrop-blur">
                <p className="eyebrow mb-2">{t('Quick add — {color}', { color: t(color) })}</p>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.inventory_count <= 0}
                      onClick={() => {
                        if (addToCart(product, v, 1)) setQuickOpen(false);
                      }}
                      aria-label={
                        v.inventory_count <= 0
                          ? t('Add size {size} to cart, sold out', { size: v.size })
                          : t('Add size {size} to cart', { size: v.size })
                      }
                      className="inline-flex h-9 min-w-10 items-center justify-center rounded-[3px] border border-border-strong px-2 text-[0.8125rem] font-medium transition-colors hover:border-fg hover:bg-fg hover:text-bg disabled:cursor-not-allowed disabled:text-muted/50 disabled:line-through disabled:hover:border-border-strong disabled:hover:bg-transparent disabled:hover:text-muted/50"
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-muted">{product.brand}</p>
          <ColorDots swatches={swatches} value={color} onSelect={setColor} />
        </div>
        <h3 className="font-sans text-[0.9375rem] font-medium leading-snug tracking-normal">
          <Link to={href} className="hover:underline underline-offset-4">
            {product.title}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.review_count} size={12} />
        <Price price={product.price} compareAt={product.compare_at_price} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-3 h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-2 h-4 w-14" />
    </div>
  );
}
