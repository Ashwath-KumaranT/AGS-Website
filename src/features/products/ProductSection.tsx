import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/ui/primitives';
import { useProducts, useProductsByIds } from '@/hooks/queries';
import { useT } from '@/i18n';
import type { ProductQuery } from '@/types';
import { ProductGrid, ProductGridSkeleton } from './ProductGrid';

export function SectionHeading({
  eyebrow,
  title,
  to,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  to?: string;
  /** English label; defaults to "View all". Translated here. */
  linkLabel?: string;
}) {
  const { t, tm } = useT();
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{tm(eyebrow)}</p>}
        <h2 className="text-3xl md:text-4xl">{tm(title)}</h2>
      </div>
      {to && (
        <Link
          to={to}
          className="group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-medium underline-offset-4 hover:underline"
        >
          {linkLabel ? tm(linkLabel) : t('View all')}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

export function ProductSection({
  query,
  eyebrow,
  title,
  to,
}: {
  query: ProductQuery;
  eyebrow?: string;
  title: string;
  to?: string;
}) {
  const { data, isLoading, isError, refetch } = useProducts(query);
  const { tm } = useT();
  return (
    <section className="container-page py-12 md:py-16" aria-label={tm(title)}>
      <SectionHeading eyebrow={eyebrow} title={title} to={to} />
      {isLoading ? (
        <ProductGridSkeleton count={query.pageSize ?? 4} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} className="py-10" />
      ) : data && data.items.length > 0 ? (
        <ProductGrid products={data.items} />
      ) : null}
    </section>
  );
}

export function ProductsByIdsSection({
  ids,
  eyebrow,
  title,
}: {
  ids: string[];
  eyebrow?: string;
  title: string;
}) {
  const { data, isLoading } = useProductsByIds(ids);
  const { tm } = useT();
  if (ids.length === 0) return null;
  // preserve the requested order
  const items = ids
    .map((id) => data?.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section className="container-page py-12 md:py-16" aria-label={tm(title)}>
      <SectionHeading eyebrow={eyebrow} title={title} />
      {isLoading ? (
        <ProductGridSkeleton count={Math.min(ids.length, 4)} />
      ) : (
        <ProductGrid products={items.slice(0, 4)} />
      )}
    </section>
  );
}
