import { ArrowRight, Quote, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { Rating } from '@/components/ui/primitives';
import { ProductSection, ProductsByIdsSection } from '@/features/products/ProductSection';
import { usePublicCoupons } from '@/hooks/queries';
import { useT } from '@/i18n';
import { garmentUrl } from '@/lib/garment';
import { useRecentStore } from '@/store/uiStore';

const TILES = [
  { label: 'Women', to: '/women', img: garmentUrl('dress', 'b5714f', 0) },
  { label: 'Men', to: '/men', img: garmentUrl('jacket', '3d4a3a', 0) },
  { label: 'Kids', to: '/kids', img: garmentUrl('hoodie', 'd9a441', 0) },
  { label: 'Sale', to: '/sale', img: garmentUrl('sweater', 'c9a99a', 2) },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    text: 'The linen shirt is unreal — it looks expensive, feels better and it arrived in two days.',
    rating: 5,
    item: 'Linen Camp-Collar Shirt',
  },
  {
    name: 'Daniel M.',
    text: 'Finally a pair of jeans that fit straight out of the box. Quality is outstanding for the price.',
    rating: 5,
    item: 'Straight-Fit Selvedge Jeans',
  },
  {
    name: 'Amelia R.',
    text: 'Easy returns and great service. The wrap dress is now my go-to for every occasion.',
    rating: 4.5,
    item: 'Wrap Midi Dress',
  },
];

export default function HomePage() {
  const viewed = useRecentStore((s) => s.viewed);
  const { data: coupons = [] } = usePublicCoupons();
  const { t, tm } = useT();

  return (
    <>
      <Seo />

      {/* Hero */}
      <section
        className="relative isolate overflow-hidden bg-subtle"
        aria-label={t('Featured campaign')}
      >
        <div className="container-page grid items-center gap-8 py-10 md:grid-cols-2 md:py-0 lg:gap-16">
          <div className="animate-slide-up order-2 md:order-1 md:py-24">
            <p className="eyebrow mb-4">{t('Autumn / Winter collection')}</p>
            <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98]">
              {t('Quiet clothes')}
              <br />
              <em className="font-light italic text-accent">{t('for loud days.')}</em>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted md:text-lg">
              {t(
                'Considered essentials in natural fibres — cut generously, made to last and easy to wear on repeat.',
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/women" size="lg">
                {t('Shop women')}
              </ButtonLink>
              <ButtonLink to="/men" size="lg" variant="outline">
                {t('Shop men')}
              </ButtonLink>
            </div>
          </div>
          <div className="relative order-1 mx-auto aspect-[4/5] w-full max-w-md md:order-2 md:max-w-none md:self-end">
            <ProductImage
              src={garmentUrl('jacket', 'c8b6a0', 0)}
              alt={t('Belted trench coat in sand')}
              priority
              className="absolute inset-y-0 right-0 w-[78%] rounded-t-[200px] md:rounded-t-[260px]"
            />
            <ProductImage
              src={garmentUrl('dress', 'a4553a', 2)}
              alt={t('Wrap midi dress in rust')}
              priority
              className="absolute bottom-6 left-0 hidden w-[42%] rounded-[4px] border-4 border-bg shadow-soft sm:block"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-border">
        <ul className="container-page grid grid-cols-1 gap-3 py-5 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <Truck className="size-5 text-accent" aria-hidden /> {t('Free shipping over ₹1,999')}
          </li>
          <li className="flex items-center gap-3">
            <RotateCcw className="size-5 text-accent" aria-hidden /> {t('7-day free returns')}
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-accent" aria-hidden /> {t('Secure checkout')}
          </li>
        </ul>
      </div>

      {/* Category tiles */}
      <section className="container-page py-12 md:py-16" aria-label={t('Shop by category')}>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {TILES.map((tile) => (
            <li key={tile.label}>
              <Link to={tile.to} className="group relative block overflow-hidden rounded-[4px]">
                <ProductImage
                  src={tile.img}
                  alt=""
                  className="aspect-[4/5] w-full [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <span className="font-display text-2xl">{t(tile.label)}</span>
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProductSection
        eyebrow="Just landed"
        title="New arrivals"
        to="/new-arrivals"
        query={{ collection: 'new-arrivals', pageSize: 4 }}
      />

      {/* Editorial banner */}
      <section className="bg-fg text-bg" aria-label={t('Editorial')}>
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-2 md:gap-16 md:py-0">
          <div className="md:py-24">
            <p className="eyebrow mb-4 text-bg/60">{t('The linen edit')}</p>
            <h2 className="text-4xl md:text-6xl">{t('Softened by sun, washed by hand.')}</h2>
            <p className="mt-5 max-w-md text-bg/70">
              {t(
                'European flax linen, garment-washed for a lived-in feel from the first wear. Breezy shirts, slip dresses and easy trousers.',
              )}
            </p>
            <ButtonLink
              to="/shop?q=linen"
              variant="outline"
              size="lg"
              className="mt-8 border-bg/40 text-bg hover:bg-bg/10"
            >
              {t('Explore the edit')}
            </ButtonLink>
          </div>
          <div className="flex gap-4 md:justify-end">
            <ProductImage
              src={garmentUrl('shirt', 'c8b6a0', 3)}
              alt=""
              className="aspect-[4/5] w-1/2 rounded-[4px] md:w-56"
            />
            <ProductImage
              src={garmentUrl('dress', '9aa88a', 0)}
              alt=""
              className="mt-10 aspect-[4/5] w-1/2 rounded-[4px] md:w-56"
            />
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Customer favourites"
        title="Best sellers"
        to="/shop?sort=featured"
        query={{ collection: 'best-sellers', pageSize: 4 }}
      />

      {/* Offers */}
      {coupons.length > 0 && (
        <section className="container-page" aria-label={t('Offers')}>
          <div className="grid gap-4 rounded-[6px] border border-border bg-subtle/60 p-6 md:grid-cols-3 md:p-8">
            {coupons.map((c) => (
              <div key={c.code} className="border-border md:border-r md:pr-6 last:border-r-0">
                <p className="eyebrow mb-1">{t('Use code')}</p>
                <p className="font-display text-2xl tracking-wider">{c.code}</p>
                <p className="mt-1 text-sm text-muted">{tm(c.description)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ProductsByIdsSection
        eyebrow="Pick up where you left off"
        title="Recently viewed"
        ids={viewed}
      />

      {/* Reviews */}
      <section className="container-page py-12 md:py-20" aria-label={t('Customer reviews')}>
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">{t('Loved by customers')}</p>
          <h2 className="text-3xl md:text-4xl">{t('What people are saying')}</h2>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((review) => (
            <li key={review.name} className="rounded-[6px] border border-border bg-surface p-6">
              <Quote className="mb-3 size-6 text-accent" aria-hidden />
              <p className="text-[0.9375rem] leading-relaxed">{t(review.text)}</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="text-xs text-muted">{t(review.item)}</p>
                </div>
                <Rating value={review.rating} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
