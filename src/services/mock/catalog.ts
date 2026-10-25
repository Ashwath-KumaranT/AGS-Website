import { translate } from '@/i18n';
import { ApiError, type CatalogService } from '@/services/types';
import type {
  Category,
  ProductFacets,
  ProductQuery,
  ProductWithVariants,
  Review,
  SortKey,
} from '@/types';
import { db, delay, uid } from './db';
import { CATEGORIES, GENDER_SLUGS, PRODUCTS, seedReviews } from './seed';

/** Applies mutable state (inventory deltas, user reviews) on top of the immutable seed. */
export function getCatalog(): ProductWithVariants[] {
  const inv = db.inventory();
  const userReviews = db.reviews();
  return PRODUCTS.map((p) => {
    const extra = userReviews.filter((r) => r.product_id === p.id);
    const reviewCount = p.review_count + extra.length;
    const rating =
      extra.length === 0
        ? p.rating
        : Math.round(
            ((p.rating * p.review_count + extra.reduce((s, r) => s + r.rating, 0)) / reviewCount) *
              10,
          ) / 10;
    return {
      ...p,
      rating,
      review_count: reviewCount,
      variants: p.variants.map((v) => ({
        ...v,
        inventory_count: Math.max(0, v.inventory_count + (inv[v.id] ?? 0)),
      })),
    };
  }).filter((p) => p.status === 'active');
}

const inStock = (p: ProductWithVariants) => p.variants.some((v) => v.inventory_count > 0);
const onSale = (p: ProductWithVariants) =>
  p.compare_at_price !== null && p.compare_at_price > p.price;

function matchesSearch(
  p: ProductWithVariants,
  q: string,
  categories: Category[] = CATEGORIES,
): boolean {
  const hay = [
    p.title,
    p.brand,
    p.description,
    p.material,
    p.gender,
    categories.find((c) => c.id === p.category_id)?.name ?? '',
    ...new Set(p.variants.map((v) => v.color)),
    // Tamil equivalents, so shoppers can search in either language
    ...[p.title, p.description, categories.find((c) => c.id === p.category_id)?.name ?? '']
      .concat([...new Set(p.variants.map((v) => v.color))])
      .map((s) => translate(s, undefined, 'ta')),
  ]
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok) || hay.includes(tok.replace(/s$/, '')));
}

function computeFacets(items: ProductWithVariants[]): ProductFacets {
  const brands = [...new Set(items.map((p) => p.brand))].sort();
  const colorMap = new Map<string, string>();
  const sizes = new Set<string>();
  items.forEach((p) =>
    p.variants.forEach((v) => {
      colorMap.set(v.color, v.color_hex);
      sizes.add(v.size);
    }),
  );
  const order = ['XS', 'S', 'M', 'L', 'XL'];
  const sortedSizes = [...sizes].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  const prices = items.map((p) => p.price);
  return {
    brands,
    colors: [...colorMap]
      .map(([name, hex]) => ({ name, hex }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    sizes: sortedSizes,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}

const discountPct = (p: ProductWithVariants) =>
  p.compare_at_price ? (p.compare_at_price - p.price) / p.compare_at_price : 0;

function sortProducts(items: ProductWithVariants[], sort: SortKey): ProductWithVariants[] {
  const arr = [...items];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case 'price_asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
    case 'discount':
      return arr.sort((a, b) => discountPct(b) - discountPct(a));
    default:
      return arr.sort(
        (a, b) =>
          Number(b.is_best_seller) - Number(a.is_best_seller) || b.review_count - a.review_count,
      );
  }
}

export function queryProducts(
  query: ProductQuery,
  all: ProductWithVariants[] = getCatalog(),
  categories: Category[] = CATEGORIES,
) {
  let base = all;
  if (query.ids) base = base.filter((p) => query.ids?.includes(p.id));
  if (query.excludeId) base = base.filter((p) => p.id !== query.excludeId);
  if (query.category) {
    const slug = query.category;
    base = (GENDER_SLUGS as readonly string[]).includes(slug)
      ? base.filter((p) => p.gender === slug)
      : base.filter((p) => p.category_id === slug);
  }
  if (query.collection === 'new-arrivals') base = base.filter((p) => p.is_new);
  if (query.collection === 'sale') base = base.filter(onSale);
  if (query.collection === 'best-sellers') base = base.filter((p) => p.is_best_seller);
  if (query.search?.trim())
    base = base.filter((p) => matchesSearch(p, query.search as string, categories));

  const facets = computeFacets(base);

  let filtered = base;
  if (query.brands?.length) filtered = filtered.filter((p) => query.brands?.includes(p.brand));
  if (query.colors?.length) {
    filtered = filtered.filter((p) => p.variants.some((v) => query.colors?.includes(v.color)));
  }
  if (query.sizes?.length) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => query.sizes?.includes(v.size) && v.inventory_count > 0),
    );
  }
  if (query.minPrice !== undefined)
    filtered = filtered.filter((p) => p.price >= (query.minPrice as number));
  if (query.maxPrice !== undefined)
    filtered = filtered.filter((p) => p.price <= (query.maxPrice as number));
  if (query.inStockOnly) filtered = filtered.filter(inStock);
  if (query.onSale) filtered = filtered.filter(onSale);

  const sort: SortKey = query.sort ?? (query.collection === 'new-arrivals' ? 'newest' : 'featured');
  const sorted = sortProducts(filtered, sort);

  const pageSize = query.pageSize ?? 12;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
    pageCount,
    facets,
  };
}

export const mockCatalog: CatalogService = {
  async listProducts(query) {
    return delay(queryProducts(query));
  },

  async getProductBySlug(slug) {
    return delay(getCatalog().find((p) => p.slug === slug) ?? null);
  },

  async getProductsByIds(ids) {
    const set = new Set(ids);
    return delay(
      getCatalog().filter((p) => set.has(p.id)),
      120,
    );
  },

  async getCategories(): Promise<Category[]> {
    return delay(CATEGORIES, 80);
  },

  async suggest(query) {
    const q = query.trim();
    if (q.length < 2) return delay({ products: [], categories: [] }, 0);
    const all = getCatalog();
    const products = all.filter((p) => matchesSearch(p, q)).slice(0, 5);
    const categories = CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 4);
    return delay({ products, categories }, 80);
  },

  async getRelated(productId, limit = 4) {
    const all = getCatalog();
    const current = all.find((p) => p.id === productId);
    if (!current) return delay([], 60);
    const same = all.filter((p) => p.id !== productId && p.category_id === current.category_id);
    const gender = all.filter(
      (p) =>
        p.id !== productId && p.gender === current.gender && p.category_id !== current.category_id,
    );
    return delay([...same, ...gender].slice(0, limit), 100);
  },

  async listReviews(productId): Promise<Review[]> {
    const all = [
      ...seedReviews().filter((r) => r.product_id === productId),
      ...db.reviews().filter((r) => r.product_id === productId),
    ];
    return delay(
      all.sort((a, b) => b.created_at.localeCompare(a.created_at)),
      100,
    );
  },

  async addReview(input) {
    const session = db.session();
    const user = db.users().find((u) => u.id === session?.userId);
    if (!session || !user || session.expiresAt < Date.now()) {
      throw new ApiError('AUTH_REQUIRED', 'Please sign in to write a review.');
    }
    const review: Review = {
      id: uid('rev'),
      product_id: input.productId,
      user_id: user.id,
      author_name: user.name,
      rating: input.rating,
      title: input.title,
      body: input.body,
      verified_purchase: db
        .orders()
        .some(
          (o) =>
            o.user_id === user.id &&
            o.payment.status === 'succeeded' &&
            o.items.some((i) => i.product_id === input.productId),
        ),
      created_at: new Date().toISOString(),
    };
    db.setReviews([review, ...db.reviews()]);
    // flag matching order items as reviewed
    db.setOrders(
      db.orders().map((o) =>
        o.user_id === user.id
          ? {
              ...o,
              items: o.items.map((i) =>
                i.product_id === input.productId ? { ...i, reviewed: true } : i,
              ),
            }
          : o,
      ),
    );
    return delay(review);
  },
};
