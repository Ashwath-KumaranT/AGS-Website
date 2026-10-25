import { Clock, Search, TrendingUp, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopSheet } from '@/components/ui/Overlay';
import { ProductImage } from '@/components/ui/ProductImage';
import { Price } from '@/components/ui/primitives';
import { useDebounced } from '@/hooks/useDebounced';
import { useSuggestions } from '@/hooks/queries';
import { useT } from '@/i18n';
import { useRecentStore, useUiStore } from '@/store/uiStore';

const TRENDING = [
  'Linen shirt',
  'Wide-leg trousers',
  'Merino sweater',
  'Straight jeans',
  'Kids hoodie',
];

export function SearchPanel() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const { t } = useT();
  return (
    <TopSheet open={open} onClose={() => setOpen(false)} title={t('Search')} hideTitle>
      <SearchContent close={() => setOpen(false)} />
    </TopSheet>
  );
}

function SearchContent({ close }: { close: () => void }) {
  const [term, setTerm] = useState('');
  const debounced = useDebounced(term, 200);
  const navigate = useNavigate();
  const { t } = useT();
  const { searches, addSearch, removeSearch, clearSearches } = useRecentStore();
  const { data, isFetching } = useSuggestions(debounced);

  const go = (q: string) => {
    const query = q.trim();
    if (!query) return;
    addSearch(query);
    close();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(term);
  };

  const hasQuery = term.trim().length >= 2;
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  return (
    <div className="container-page max-w-3xl py-5">
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor="global-search" className="sr-only">
          {t('Search products')}
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          id="global-search"
          data-autofocus
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('Search for dresses, jeans, knitwear…')}
          autoComplete="off"
          role="combobox"
          aria-expanded={hasQuery}
          aria-controls="search-results"
          className="h-14 w-full rounded-[4px] border border-border-strong bg-surface pl-12 pr-12 text-base placeholder:text-muted/70 focus:border-fg focus:outline-none"
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label={t('Clear search')}
            className="absolute right-1.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full hover:bg-subtle"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      <div id="search-results" aria-live="polite" className="mt-6 min-h-40">
        {!hasQuery ? (
          <div className="grid gap-8 sm:grid-cols-2">
            <section aria-labelledby="recent-h">
              <div className="mb-3 flex items-center justify-between">
                <h3 id="recent-h" className="eyebrow font-sans">
                  {t('Recent searches')}
                </h3>
                {searches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSearches}
                    className="text-xs text-muted underline underline-offset-4 hover:text-fg"
                  >
                    {t('Clear')}
                  </button>
                )}
              </div>
              {searches.length === 0 ? (
                <p className="text-sm text-muted">{t('Your recent searches will appear here.')}</p>
              ) : (
                <ul>
                  {searches.map((s) => (
                    <li key={s} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => go(s)}
                        className="flex min-h-11 flex-1 items-center gap-3 text-left text-sm hover:text-accent"
                      >
                        <Clock className="size-4 text-muted" aria-hidden />
                        {s}
                      </button>
                      <button
                        type="button"
                        aria-label={t('Remove {term}', { term: s })}
                        onClick={() => removeSearch(s)}
                        className="inline-flex size-9 items-center justify-center text-muted hover:text-fg"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section aria-labelledby="trending-h">
              <h3 id="trending-h" className="eyebrow mb-3 font-sans">
                {t('Trending')}
              </h3>
              <ul>
                {TRENDING.map((s) => {
                  // search with the term as displayed, so results match the shopper's language
                  const label = t(s);
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="flex min-h-11 w-full items-center gap-3 text-left text-sm hover:text-accent"
                      >
                        <TrendingUp className="size-4 text-muted" aria-hidden />
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        ) : products.length === 0 && categories.length === 0 && !isFetching ? (
          <div className="py-10 text-center">
            <p className="font-display text-xl">
              {t('No results for “{term}”', { term: debounced })}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t('Check the spelling or try a broader term like “shirt” or “dress”.')}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
            {categories.length > 0 && (
              <section aria-labelledby="cat-h">
                <h3 id="cat-h" className="eyebrow mb-3 font-sans">
                  {t('Categories')}
                </h3>
                <ul>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/shop/${c.slug}`}
                        onClick={close}
                        className="flex min-h-11 items-center text-sm hover:text-accent"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section
              aria-labelledby="prod-h"
              className={categories.length === 0 ? 'sm:col-span-2' : ''}
            >
              <h3 id="prod-h" className="eyebrow mb-3 font-sans">
                {t('Products')}
              </h3>
              <ul className="grid gap-1">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={() => {
                        addSearch(term);
                        close();
                      }}
                      className="flex items-center gap-4 rounded-[4px] p-2 hover:bg-subtle"
                    >
                      <ProductImage
                        src={p.variants[0]?.image_urls[0] ?? ''}
                        alt=""
                        className="aspect-[4/5] w-12 shrink-0 rounded-[3px]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.title}</span>
                        <span className="block text-xs text-muted">{p.brand}</span>
                      </span>
                      <Price price={p.price} compareAt={p.compare_at_price} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => go(term)}
                  className="mt-3 min-h-11 text-sm font-medium underline underline-offset-4 hover:text-accent"
                >
                  {t('See all results for “{term}”', { term: term.trim() })}
                </button>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
