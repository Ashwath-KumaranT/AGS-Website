import { describe, expect, it } from 'vitest';
import { queryProducts } from '@/services/mock/catalog';
import { PRODUCTS } from '@/services/mock/seed';
import {
  activeChips,
  clearFilters,
  parseFilters,
  serializeFilters,
  toProductQuery,
} from './filters';

describe('URL filters', () => {
  it('round-trips through the query string and keeps the search term', () => {
    const sp = new URLSearchParams(
      'q=linen&brand=ASG,Nordhavn&size=M&min=50&max=100&stock=1&sort=price_asc&page=2',
    );
    const f = parseFilters(sp);
    expect(f).toMatchObject({
      brands: ['ASG', 'Nordhavn'],
      sizes: ['M'],
      min: 50,
      max: 100,
      inStock: true,
      sort: 'price_asc',
      page: 2,
    });
    expect(serializeFilters(f, sp).toString()).toBe(sp.toString());
  });

  it('keeps the mega-menu category when the filters change', () => {
    const sp = new URLSearchParams('cat=women&brand=ASG');
    const next = serializeFilters({ ...parseFilters(sp), sort: 'price_asc' }, sp);
    expect(next.get('cat')).toBe('women');
    expect(next.get('sort')).toBe('price_asc');
  });

  it('ignores junk values', () => {
    const f = parseFilters(new URLSearchParams('sort=hack&page=-3&min=abc'));
    expect(f.sort).toBe('featured');
    expect(f.page).toBe(1);
    expect(f.min).toBeUndefined();
  });

  it('converts dollars to cents for the query', () => {
    const q = toProductQuery(
      { category: 'men' },
      parseFilters(new URLSearchParams('min=50&max=100')),
    );
    expect(q).toMatchObject({ category: 'men', minPrice: 5000, maxPrice: 10000 });
  });

  it('builds removable chips and clears everything', () => {
    const f = parseFilters(new URLSearchParams('color=Navy&sale=1'));
    const chips = activeChips(f);
    expect(chips.map((c) => c.label)).toEqual(['Navy', 'On sale']);
    expect(chips[0]?.apply(f).colors).toEqual([]);
    expect(activeChips(clearFilters(f))).toEqual([]);
  });
});

describe('catalog querying', () => {
  it('filters by gender, sorts by price and paginates', () => {
    const r = queryProducts({ category: 'women', sort: 'price_asc', pageSize: 5 }, PRODUCTS);
    expect(r.items.every((p) => p.gender === 'women')).toBe(true);
    const prices = r.items.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(r.pageCount).toBe(Math.ceil(r.total / 5));
  });

  it('searches across title, colour and category', () => {
    expect(queryProducts({ search: 'linen' }, PRODUCTS).items.length).toBeGreaterThan(0);
    expect(queryProducts({ search: 'zzzz' }, PRODUCTS).total).toBe(0);
  });

  it('only matches sizes that are in stock', () => {
    const r = queryProducts({ sizes: ['XL'], category: 'men-knitwear' }, PRODUCTS);
    // the cable knit is sold out in XL
    expect(r.items.find((p) => p.slug === 'chunky-cable-knit')).toBeUndefined();
  });

  it('returns sale items only for the sale collection', () => {
    const r = queryProducts({ collection: 'sale', pageSize: 100 }, PRODUCTS);
    expect(r.items.every((p) => (p.compare_at_price ?? 0) > p.price)).toBe(true);
  });
});
