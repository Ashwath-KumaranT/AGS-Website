import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { ProductWithVariants } from '@/types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

const gridClass = 'grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:gap-x-6 lg:gap-y-10';

export function ProductGrid({
  products,
  columns = 4,
  className,
  priorityCount = 0,
}: {
  products: ProductWithVariants[];
  columns?: 3 | 4;
  className?: string;
  priorityCount?: number;
}) {
  return (
    <ul
      className={cn(
        gridClass,
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 2xl:grid-cols-4',
        className,
      )}
    >
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number;
  columns?: 3 | 4;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div
      className={cn(
        gridClass,
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 2xl:grid-cols-4',
        className,
      )}
      role="status"
      aria-label={t('Loading products')}
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
