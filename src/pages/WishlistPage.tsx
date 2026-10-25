import { Heart } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, EmptyState, ErrorState } from '@/components/ui/primitives';
import { ProductGrid, ProductGridSkeleton } from '@/features/products/ProductGrid';
import { ProductSection } from '@/features/products/ProductSection';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { useProductsByIds } from '@/hooks/queries';
import { useT } from '@/i18n';

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);
  const { t } = useT();
  const { data, isLoading, isError, refetch } = useProductsByIds(ids);
  // keep the user's order (most recently saved first); drop products that no longer exist
  const items = ids
    .map((id) => data?.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container-page py-6 md:py-10">
      <Seo title={t('Wishlist')} noindex />
      <Breadcrumbs items={[{ label: t('Home'), to: '/' }, { label: t('Wishlist') }]} />
      <div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl">{t('Wishlist')}</h1>
          {ids.length > 0 && (
            <p className="mt-2 text-muted">
              {ids.length === 1
                ? t('{count} saved item', { count: ids.length })
                : t('{count} saved items', { count: ids.length })}
            </p>
          )}
        </div>
        {ids.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            {t('Clear all')}
          </Button>
        )}
      </div>

      {ids.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" aria-hidden />}
          title={t('Your wishlist is empty')}
          description={t('Tap the heart on any product to save it here for later.')}
          action={{ label: t('Discover new arrivals'), to: '/new-arrivals' }}
        />
      ) : isLoading ? (
        <ProductGridSkeleton count={Math.min(ids.length, 8)} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <ProductGrid products={items} />
      )}

      {ids.length === 0 && (
        <ProductSection
          eyebrow="Start here"
          title="Best sellers"
          query={{ collection: 'best-sellers', pageSize: 4 }}
        />
      )}
    </div>
  );
}
