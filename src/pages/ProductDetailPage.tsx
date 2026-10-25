import { Check, RotateCcw, Truck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import {
  Accordion,
  Badge,
  Breadcrumbs,
  EmptyState,
  ErrorState,
  Price,
  QuantitySelector,
  Rating,
  Skeleton,
} from '@/components/ui/primitives';
import { useAddToCart } from '@/features/cart/hooks';
import { DeliveryChecker } from '@/features/products/DeliveryChecker';
import { Gallery } from '@/features/products/Gallery';
import { ProductSection, ProductsByIdsSection } from '@/features/products/ProductSection';
import { Reviews } from '@/features/products/Reviews';
import { SizeGuideButton } from '@/features/products/SizeGuide';
import { SizeSelector } from '@/features/products/SizeSelector';
import { ColorSwatches } from '@/features/products/ColorSwatches';
import {
  firstAvailableColor,
  getSwatches,
  productJsonLd,
  variantsForColor,
} from '@/features/products/utils';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import { useCategories, useProduct, useRelated } from '@/hooks/queries';
import { useT } from '@/i18n';
import { MAX_QTY_PER_LINE } from '@/lib/pricing';
import { percentOff } from '@/lib/format';
import { toast, useRecentStore } from '@/store/uiStore';
import type { ProductWithVariants } from '@/types';

function PdpSkeleton() {
  const { t } = useT();
  return (
    <div
      className="container-page grid gap-10 py-8 md:grid-cols-2"
      role="status"
      aria-label={t('Loading product')}
    >
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function ProductView({ product }: { product: ProductWithVariants }) {
  const navigate = useNavigate();
  const { t } = useT();
  const addToCart = useAddToCart();
  const addViewed = useRecentStore((s) => s.addViewed);
  const viewed = useRecentStore((s) => s.viewed);
  const { data: categories = [] } = useCategories();
  const { data: related } = useRelated(product.id);

  const [color, setColor] = useState(() => firstAvailableColor(product));
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const ctaRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  useEffect(() => addViewed(product.id), [product.id, addViewed]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setCtaVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const swatches = useMemo(() => getSwatches(product), [product]);
  const colorVariants = useMemo(() => variantsForColor(product, color), [product, color]);
  const variant = colorVariants.find((v) => v.size === size) ?? null;
  const images = colorVariants[0]?.image_urls ?? [];
  const category = categories.find((c) => c.id === product.category_id);
  const parent = category?.parent_id
    ? categories.find((c) => c.id === category.parent_id)
    : undefined;
  const pct = percentOff(product.price, product.compare_at_price);
  const allSoldOut = product.variants.every((v) => v.inventory_count <= 0);

  const changeColor = (next: string) => {
    setColor(next);
    const stillOk = variantsForColor(product, next).find(
      (v) => v.size === size && v.inventory_count > 0,
    );
    if (!stillOk) setSize(null);
    setQty(1);
  };

  const requireVariant = () => {
    if (!variant) {
      setSizeError(true);
      // English here; the Toaster translates title and description
      toast.error('Choose a size first', 'Pick your size, then add the item to your bag.');
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sizeRef.current
        ?.querySelector<HTMLInputElement>('input:not(:disabled)')
        ?.focus({ preventScroll: true });
      return null;
    }
    return variant;
  };

  const handleAdd = () => {
    const v = requireVariant();
    if (!v) return;
    if (addToCart(product, v, qty)) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    const v = requireVariant();
    if (!v) return;
    if (addToCart(product, v, qty, { openDrawer: false })) navigate('/checkout');
  };

  const stockMessage = () => {
    if (!variant) return null;
    if (variant.inventory_count <= 0)
      return { tone: 'text-sale', text: t('Sold out in this size') };
    if (variant.inventory_count <= 3)
      return {
        tone: 'text-warning',
        text: t('Only {count} left — order soon', { count: variant.inventory_count }),
      };
    return { tone: 'text-success', text: t('In stock — ships within 24 hours') };
  };
  const stock = stockMessage();
  const maxQty = Math.min(variant?.inventory_count ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);

  const crumbs = [
    { label: t('Home'), to: '/' },
    ...(parent ? [{ label: parent.name, to: `/${parent.slug}` }] : []),
    ...(category ? [{ label: category.name, to: `/shop/${category.slug}` }] : []),
    { label: product.title },
  ];

  const url = `${import.meta.env.VITE_SITE_URL ?? ''}/product/${product.slug}`;

  return (
    <>
      <Seo
        title={product.title}
        description={product.description.slice(0, 155)}
        image={images[0]}
        type="product"
        jsonLd={productJsonLd(product, url)}
      />
      <div className="container-page pb-4 pt-6 md:pt-8">
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="container-page grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <Gallery
          images={images}
          title={t('{title} in {color}', { title: product.title, color: t(color) })}
        />

        <div className="md:sticky md:top-24 md:self-start">
          <div className="flex items-center gap-2">
            <p className="eyebrow">{product.brand}</p>
            {product.is_new && <Badge tone="dark">{t('New')}</Badge>}
            {pct > 0 && <Badge tone="sale">−{pct}%</Badge>}
          </div>
          <h1 className="mt-2 text-4xl md:text-[2.6rem]">{product.title}</h1>
          <a href="#reviews" className="mt-3 inline-block">
            <Rating value={product.rating} count={product.review_count} size={15} />
          </a>
          <div className="mt-4">
            <Price
              price={product.price}
              compareAt={product.compare_at_price}
              size="lg"
              showPercent
            />
            <p className="mt-0.5 text-xs text-muted">
              {t('Tax included in estimate at checkout.')}
            </p>
          </div>

          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">{product.description}</p>

          {allSoldOut ? (
            <div
              className="mt-8 rounded-[4px] border border-sale/40 bg-sale/10 p-4 text-sm text-sale"
              role="status"
            >
              <p className="font-medium">{t('Currently sold out')}</p>
              <p className="mt-1">
                {t('This item is unavailable in every size. Check out similar styles below.')}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-7">
                <p className="mb-2.5 text-sm">
                  <span className="font-medium">{t('Colour:')}</span>{' '}
                  <span className="text-muted">{t(color)}</span>
                </p>
                <ColorSwatches swatches={swatches} value={color} onChange={changeColor} />
              </div>

              <div className="mt-6" ref={sizeRef}>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{t('Size:')}</span>{' '}
                    <span className="text-muted">{size ?? t('Select a size')}</span>
                  </p>
                  <SizeGuideButton gender={product.gender} />
                </div>
                <SizeSelector
                  variants={colorVariants}
                  value={size}
                  error={sizeError}
                  onChange={(s) => {
                    setSize(s);
                    setSizeError(false);
                    setQty(1);
                  }}
                />
                {sizeError && (
                  <p role="alert" className="mt-2 text-sm font-medium text-sale">
                    {t('Please select a size.')}
                  </p>
                )}
                {stock && (
                  <p
                    className={`mt-3 flex items-center gap-1.5 text-sm ${stock.tone}`}
                    aria-live="polite"
                    data-testid="stock-message"
                  >
                    <Check className="size-4" aria-hidden /> {stock.text}
                  </p>
                )}
              </div>

              <div ref={ctaRef} className="mt-7 space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="shrink-0">
                    <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, maxQty)} />
                  </div>
                  <Button
                    size="lg"
                    block
                    className="order-last min-w-[11rem] flex-1 px-3 sm:px-7"
                    onClick={handleAdd}
                    disabled={variant !== null && variant.inventory_count <= 0}
                    data-testid="add-to-cart"
                  >
                    {justAdded ? t('Added ✓') : t('Add to bag')}
                  </Button>
                  <WishlistButton
                    productId={product.id}
                    title={product.title}
                    variant="plain"
                    className="shrink-0"
                  />
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  block
                  onClick={handleBuyNow}
                  disabled={variant !== null && variant.inventory_count <= 0}
                >
                  {t('Buy now')}
                </Button>
              </div>
            </>
          )}

          <ul className="mt-6 grid gap-2 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 text-accent" aria-hidden />{' '}
              {t('Free standard shipping over ₹1,999')}
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="size-4 text-accent" aria-hidden />{' '}
              {t('Free returns within 7 days')}
            </li>
          </ul>

          <div className="mt-6">
            <DeliveryChecker />
          </div>

          <div className="mt-8 border-t border-border">
            <Accordion title={t('Product details')} defaultOpen>
              <ul className="list-disc space-y-1 pl-5">
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title={t('Materials')}>
              <p>{product.material}</p>
            </Accordion>
            <Accordion title={t('Care instructions')}>
              <ul className="list-disc space-y-1 pl-5">
                {product.care.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title={t('Shipping & returns')}>
              <p>
                {t(
                  'Orders ship within 24 hours. Returns are free within 7 days of delivery for unworn items with tags attached.',
                )}
              </p>
              <p className="mt-2">
                <Link to="/shipping" className="underline underline-offset-4">
                  {t('Read the full policy')}
                </Link>
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      <Reviews product={product} />

      {related && related.length > 0 && (
        <ProductSection
          eyebrow="Complete the look"
          title="You may also like"
          query={{ ids: related.map((r) => r.id), pageSize: 4 }}
        />
      )}
      <ProductsByIdsSection
        eyebrow="Pick up where you left off"
        title="Recently viewed"
        ids={viewed.filter((id) => id !== product.id)}
      />

      {/* sticky mobile purchase bar */}
      {!allSoldOut && !ctaVisible && (
        <div className="fixed inset-x-0 bottom-[3.75rem] z-30 flex items-center gap-3 border-t border-border bg-bg/95 px-4 py-2.5 backdrop-blur md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <Price price={product.price} compareAt={product.compare_at_price} size="sm" />
          </div>
          <Button onClick={handleAdd}>{size ? t('Add to bag') : t('Select size')}</Button>
        </div>
      )}
    </>
  );
}

export default function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const { t } = useT();

  if (isLoading) return <PdpSkeleton />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!product) {
    return (
      <>
        <Seo title={t('Product not found')} noindex />
        <EmptyState
          title={t('We couldn’t find that product')}
          description={t('It may have been removed or the link is incorrect.')}
          action={{ label: t('Continue shopping'), to: '/shop' }}
        />
      </>
    );
  }
  // key resets local selection state when navigating between products
  return <ProductView key={product.id} product={product} />;
}
