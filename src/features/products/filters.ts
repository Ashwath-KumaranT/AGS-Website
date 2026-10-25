import { translate } from '@/i18n';
import type { ProductQuery, SortKey } from '@/types';

export interface FilterState {
  brands: string[];
  colors: string[];
  sizes: string[];
  /** dollars, as shown in the URL */
  min?: number;
  max?: number;
  inStock: boolean;
  onSale: boolean;
  sort: SortKey;
  page: number;
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Biggest discount' },
];

export const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'Any price' },
  { label: 'Under ₹1,500', max: 1500 },
  { label: '₹1,500 – ₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000 – ₹6,000', min: 3000, max: 6000 },
  { label: '₹6,000 & over', min: 6000 },
];

const SORTS = new Set<SortKey>(SORT_OPTIONS.map((o) => o.value));

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const num = (v: string | null) => {
  if (v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseFilters(sp: URLSearchParams): FilterState {
  const sort = sp.get('sort') as SortKey | null;
  const page = Number(sp.get('page') ?? 1);
  return {
    brands: list(sp.get('brand')),
    colors: list(sp.get('color')),
    sizes: list(sp.get('size')),
    min: num(sp.get('min')),
    max: num(sp.get('max')),
    inStock: sp.get('stock') === '1',
    onSale: sp.get('sale') === '1',
    sort: sort && SORTS.has(sort) ? sort : 'featured',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Params that scope the page itself rather than the filters, and so survive a filter change. */
const PRESERVED_PARAMS = ['q', 'cat'] as const;

/** Serializes filters, preserving unrelated params such as `q` and `cat`. */
export function serializeFilters(f: FilterState, existing?: URLSearchParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const key of PRESERVED_PARAMS) {
    const value = existing?.get(key);
    if (value) sp.set(key, value);
  }
  if (f.brands.length) sp.set('brand', f.brands.join(','));
  if (f.colors.length) sp.set('color', f.colors.join(','));
  if (f.sizes.length) sp.set('size', f.sizes.join(','));
  if (f.min !== undefined) sp.set('min', String(f.min));
  if (f.max !== undefined) sp.set('max', String(f.max));
  if (f.inStock) sp.set('stock', '1');
  if (f.onSale) sp.set('sale', '1');
  if (f.sort !== 'featured') sp.set('sort', f.sort);
  if (f.page > 1) sp.set('page', String(f.page));
  return sp;
}

export function toProductQuery(
  base: Pick<ProductQuery, 'category' | 'collection' | 'search'>,
  f: FilterState,
  pageSize = 12,
): ProductQuery {
  return {
    ...base,
    brands: f.brands.length ? f.brands : undefined,
    colors: f.colors.length ? f.colors : undefined,
    sizes: f.sizes.length ? f.sizes : undefined,
    minPrice: f.min !== undefined ? Math.round(f.min * 100) : undefined,
    maxPrice: f.max !== undefined ? Math.round(f.max * 100) : undefined,
    inStockOnly: f.inStock || undefined,
    onSale: f.onSale || undefined,
    sort: f.sort,
    page: f.page,
    pageSize,
  };
}

const rupees = (n: number | undefined) => (n ?? 0).toLocaleString('en-IN');

export interface FilterChip {
  key: string;
  label: string;
  apply: (f: FilterState) => FilterState;
}

/** Chip labels are translated with the current UI language (English in tests). */
export function activeChips(f: FilterState): FilterChip[] {
  const chips: FilterChip[] = [];
  f.brands.forEach((b) =>
    chips.push({
      key: `brand:${b}`,
      label: b,
      apply: (s) => ({ ...s, brands: s.brands.filter((x) => x !== b), page: 1 }),
    }),
  );
  f.colors.forEach((c) =>
    chips.push({
      key: `color:${c}`,
      label: translate(c),
      apply: (s) => ({ ...s, colors: s.colors.filter((x) => x !== c), page: 1 }),
    }),
  );
  f.sizes.forEach((z) =>
    chips.push({
      key: `size:${z}`,
      label: translate('Size {size}', { size: z }),
      apply: (s) => ({ ...s, sizes: s.sizes.filter((x) => x !== z), page: 1 }),
    }),
  );
  if (f.min !== undefined || f.max !== undefined) {
    const label =
      f.min !== undefined && f.max !== undefined
        ? `₹${rupees(f.min)} – ₹${rupees(f.max)}`
        : f.min !== undefined
          ? `₹${rupees(f.min)}+`
          : translate('Under ₹{amount}', { amount: rupees(f.max) });
    chips.push({
      key: 'price',
      label,
      apply: (s) => ({ ...s, min: undefined, max: undefined, page: 1 }),
    });
  }
  if (f.inStock)
    chips.push({
      key: 'stock',
      label: translate('In stock'),
      apply: (s) => ({ ...s, inStock: false, page: 1 }),
    });
  if (f.onSale)
    chips.push({
      key: 'sale',
      label: translate('On sale'),
      apply: (s) => ({ ...s, onSale: false, page: 1 }),
    });
  return chips;
}

export function clearFilters(f: FilterState): FilterState {
  return {
    ...f,
    brands: [],
    colors: [],
    sizes: [],
    min: undefined,
    max: undefined,
    inStock: false,
    onSale: false,
    page: 1,
  };
}

export function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
