import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useLocale } from '@/i18n';
import {
  localizeCategory,
  localizeProduct,
  localizeProductPage,
  localizeProducts,
  localizeReview,
  localizeSuggestions,
} from '@/i18n/localize';
import { api } from '@/services';
import type {
  Category,
  ProductPage,
  ProductQuery,
  ProductWithVariants,
  Review,
  SearchSuggestions,
} from '@/types';

export const qk = {
  categories: ['categories'] as const,
  products: (q: ProductQuery) => ['products', q] as const,
  product: (slug: string) => ['product', slug] as const,
  productsByIds: (ids: string[]) => ['products-by-ids', [...ids].sort()] as const,
  related: (id: string) => ['related', id] as const,
  reviews: (id: string) => ['reviews', id] as const,
  suggest: (q: string) => ['suggest', q] as const,
  addresses: ['addresses'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  returns: ['returns'] as const,
  notifications: ['notifications'] as const,
  payPrefs: ['pay-prefs'] as const,
  coupons: ['coupons'] as const,
};

/**
 * Query keys holding data that belongs to the signed-in shopper. None of them carry a user
 * id, so they must be dropped when the account changes — otherwise the next person to sign
 * in on this browser is served the previous one's orders and addresses from cache.
 */
export const PERSONAL_QUERY_KEYS: readonly (readonly string[])[] = [
  qk.addresses,
  qk.orders,
  ['order'],
  qk.returns,
  qk.notifications,
  qk.payPrefs,
];

// Catalogue data is fetched once and translated in `select`, so switching
// language re-renders instantly without refetching.

export function useCategories() {
  const locale = useLocale();
  const select = useCallback(
    (d: Category[]) => d.map((c) => localizeCategory(c, locale)),
    [locale],
  );
  return useQuery({
    queryKey: qk.categories,
    queryFn: () => api.catalog.getCategories(),
    staleTime: Infinity,
    select,
  });
}

export function useProducts(query: ProductQuery) {
  const locale = useLocale();
  const select = useCallback((d: ProductPage) => localizeProductPage(d, locale), [locale]);
  return useQuery({
    queryKey: qk.products(query),
    queryFn: () => api.catalog.listProducts(query),
    placeholderData: keepPreviousData,
    select,
  });
}

export function useProduct(slug: string) {
  const locale = useLocale();
  const select = useCallback(
    (d: ProductWithVariants | null) => (d ? localizeProduct(d, locale) : d),
    [locale],
  );
  return useQuery({
    queryKey: qk.product(slug),
    queryFn: () => api.catalog.getProductBySlug(slug),
    select,
  });
}

export function useProductsByIds(ids: string[]) {
  const locale = useLocale();
  const select = useCallback((d: ProductWithVariants[]) => localizeProducts(d, locale), [locale]);
  return useQuery({
    queryKey: qk.productsByIds(ids),
    queryFn: () => api.catalog.getProductsByIds(ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
    select,
  });
}

export function useRelated(productId: string | undefined) {
  const locale = useLocale();
  const select = useCallback((d: ProductWithVariants[]) => localizeProducts(d, locale), [locale]);
  return useQuery({
    queryKey: qk.related(productId ?? ''),
    queryFn: () => api.catalog.getRelated(productId as string, 4),
    enabled: Boolean(productId),
    select,
  });
}

export function useReviews(productId: string | undefined) {
  const locale = useLocale();
  const select = useCallback((d: Review[]) => d.map((r) => localizeReview(r, locale)), [locale]);
  return useQuery({
    queryKey: qk.reviews(productId ?? ''),
    queryFn: () => api.catalog.listReviews(productId as string),
    enabled: Boolean(productId),
    select,
  });
}

export function useSuggestions(term: string) {
  const locale = useLocale();
  const select = useCallback((d: SearchSuggestions) => localizeSuggestions(d, locale), [locale]);
  return useQuery({
    queryKey: qk.suggest(term),
    queryFn: () => api.catalog.suggest(term),
    enabled: term.trim().length >= 2,
    placeholderData: keepPreviousData,
    select,
  });
}

export function usePublicCoupons() {
  return useQuery({ queryKey: qk.coupons, queryFn: () => api.checkout.listPublicCoupons() });
}
