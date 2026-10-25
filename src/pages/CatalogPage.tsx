import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Drawer } from '@/components/ui/Overlay';
import { Breadcrumbs, EmptyState, ErrorState, Pagination } from '@/components/ui/primitives';
import { FilterPanel } from '@/features/products/FilterPanel';
import { ProductGrid, ProductGridSkeleton } from '@/features/products/ProductGrid';
import { ProductSection } from '@/features/products/ProductSection';
import {
  SORT_OPTIONS,
  activeChips,
  clearFilters,
  parseFilters,
  serializeFilters,
  toProductQuery,
  type FilterState,
} from '@/features/products/filters';
import { useCategories, useProducts } from '@/hooks/queries';
import { useT } from '@/i18n';
import { useRecentStore } from '@/store/uiStore';

type Collection = 'new-arrivals' | 'sale';

interface CatalogPageProps {
  /** fixed category (e.g. the /women route) */
  category?: string;
  collection?: Collection;
  mode?: 'catalog' | 'search';
}

/** English keys, translated at render. */
const COLLECTION_META: Record<Collection, { title: string; description: string }> = {
  'new-arrivals': {
    title: 'New arrivals',
    description: 'The latest drops — fresh for the season.',
  },
  sale: { title: 'Sale', description: 'Considered essentials at considered prices.' },
};

export default function CatalogPage({
  category: fixedCategory,
  collection,
  mode = 'catalog',
}: CatalogPageProps) {
  const params = useParams();
  const [sp, setSp] = useSearchParams();
  const { data: categories = [] } = useCategories();
  const addSearch = useRecentStore((s) => s.addSearch);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useT();

  const q = (sp.get('q') ?? '').trim();
  const categorySlug =
    fixedCategory ?? params.category ?? (collection ? (sp.get('cat') ?? undefined) : undefined);
  const category = categories.find((c) => c.slug === categorySlug);
  const filters = useMemo(() => parseFilters(sp), [sp]);

  const query = useMemo(
    () => toProductQuery({ category: categorySlug, collection, search: q || undefined }, filters),
    [categorySlug, collection, q, filters],
  );
  const { data, isLoading, isError, isFetching, refetch } = useProducts(query);

  useEffect(() => {
    if (mode === 'search' && q) addSearch(q);
  }, [mode, q, addSearch]);

  const setFilters = (next: FilterState) => setSp(serializeFilters(next, sp), { replace: true });
  const setPage = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------- titles / breadcrumbs ---------- */
  const parent = category?.parent_id
    ? categories.find((c) => c.id === category.parent_id)
    : undefined;
  let title = t('Shop all');
  let description = t('Everything in the ASG collection.');
  const crumbs: { label: string; to?: string }[] = [{ label: t('Home'), to: '/' }];
  if (mode === 'search') {
    title = q ? t('Results for “{q}”', { q }) : t('Search');
    description = '';
    crumbs.push({ label: t('Search') });
  } else if (collection) {
    title = t(COLLECTION_META[collection].title);
    description = t(COLLECTION_META[collection].description);
    if (category) title = `${title} — ${category.name}`;
    crumbs.push({ label: t(COLLECTION_META[collection].title) });
  } else if (category) {
    title = parent ? `${parent.name} — ${category.name}` : category.name;
    description = category.description ?? parent?.description ?? '';
    if (parent) crumbs.push({ label: parent.name, to: `/${parent.slug}` });
    crumbs.push({ label: category.name });
  } else {
    crumbs.push({ label: t('Shop') });
  }

  const subcategories =
    category && !category.parent_id ? categories.filter((c) => c.parent_id === category.id) : [];
  const chips = activeChips(filters);
  const total = data?.total ?? 0;
  const productCount =
    total === 1 ? t('{count} product', { count: total }) : t('{count} products', { count: total });

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {chips.length > 0 ? t('Filters ({count})', { count: chips.length }) : t('Filters')}
        </Button>
        <p className="text-sm text-muted" aria-live="polite" data-testid="result-count">
          {isLoading ? t('Loading…') : productCount}
        </p>
      </div>
      <Select
        label={t('Sort by')}
        hideLabel
        value={filters.sort}
        onChange={(e) =>
          setFilters({ ...filters, sort: e.target.value as FilterState['sort'], page: 1 })
        }
        wrapperClassName="w-48"
        className="h-10 text-sm"
        aria-label={t('Sort by')}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </Select>
    </div>
  );

  return (
    <div className="container-page py-6 md:py-10">
      <Seo
        title={title}
        description={description || t('Browse {title} at ASG.', { title: title.toLowerCase() })}
        noindex={mode === 'search'}
        canonicalPath={mode === 'search' ? '/search' : undefined}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mb-6 mt-4 md:mb-8">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
        {subcategories.length > 0 && (
          <ul className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            {subcategories.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link
                  to={`/shop/${c.slug}`}
                  className="inline-flex h-10 items-center rounded-full border border-border-strong px-4 text-sm transition-colors hover:bg-fg hover:text-bg"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[15.625rem_1fr]">
        <aside className="hidden lg:block" aria-label={t('Filters')}>
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <FilterPanel facets={data?.facets} value={filters} onChange={setFilters} idPrefix="d" />
          </div>
        </aside>

        <section aria-label={t('Products')} aria-busy={isFetching}>
          {toolbar}

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label={t('Active filters')}>
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => setFilters(chip.apply(filters))}
                    aria-label={t('Remove filter {label}', { label: chip.label })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-subtle px-3.5 text-[0.8125rem] hover:bg-border"
                  >
                    {chip.label}
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <Button
                  variant="link"
                  className="text-[0.8125rem]"
                  onClick={() => setFilters(clearFilters(filters))}
                >
                  {t('Clear all')}
                </Button>
              </li>
            </ul>
          )}

          <div
            className={`mt-6 transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}
          >
            {isLoading ? (
              <ProductGridSkeleton count={8} columns={3} />
            ) : isError ? (
              <ErrorState onRetry={() => void refetch()} />
            ) : mode === 'search' && !q ? (
              <EmptyState
                title={t('What are you looking for?')}
                description={t('Type in the search bar to find dresses, jeans, knitwear and more.')}
                action={{ label: t('Browse everything'), to: '/shop' }}
              />
            ) : data && data.items.length > 0 ? (
              <>
                <ProductGrid products={data.items} columns={3} priorityCount={4} />
                <Pagination page={data.page} pageCount={data.pageCount} onChange={setPage} />
              </>
            ) : (
              <EmptyState
                title={q ? t('No results for “{q}”', { q }) : t('No products match your filters')}
                description={
                  chips.length > 0
                    ? t('Try removing a filter or two.')
                    : t('Try a different search or browse our categories.')
                }
                action={
                  chips.length === 0 ? { label: t('Browse everything'), to: '/shop' } : undefined
                }
              />
            )}
            {!isLoading && !isError && data && data.items.length === 0 && chips.length > 0 && (
              <div className="-mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setFilters(clearFilters(filters))}>
                  {t('Clear all filters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {!isLoading && data && data.items.length === 0 && mode === 'search' && (
        <ProductSection
          eyebrow="You might like"
          title="Popular right now"
          query={{ collection: 'best-sellers', pageSize: 4 }}
        />
      )}

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('Filters')}
        footer={
          <Button block size="lg" onClick={() => setFiltersOpen(false)}>
            {total === 1
              ? t('Show {count} product', { count: total })
              : t('Show {count} products', { count: total })}
          </Button>
        }
      >
        <div className="px-5">
          <FilterPanel facets={data?.facets} value={filters} onChange={setFilters} idPrefix="m" />
        </div>
      </Drawer>
    </div>
  );
}
