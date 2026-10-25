import type {
  Category,
  ProductPage,
  ProductWithVariants,
  Review,
  SearchSuggestions,
} from '@/types';
import { translate, type Locale } from './index';

/**
 * Catalogue content (product titles, descriptions, materials, care, details,
 * category names) is translated through the same dictionary as the UI — see
 * src/i18n/ta/catalog.ts. Variant colour names are NOT rewritten here because
 * they are used as identifiers (filters, selection); translate them at display
 * time with t(color).
 */
export function localizeProduct<T extends ProductWithVariants>(p: T, locale: Locale): T {
  if (locale === 'en') return p;
  const tr = (s: string) => translate(s, undefined, locale);
  return {
    ...p,
    title: tr(p.title),
    description: tr(p.description),
    material: tr(p.material),
    care: p.care.map(tr),
    details: p.details.map(tr),
  };
}

export function localizeProducts<T extends ProductWithVariants>(list: T[], locale: Locale): T[] {
  return locale === 'en' ? list : list.map((p) => localizeProduct(p, locale));
}

export function localizeProductPage(page: ProductPage, locale: Locale): ProductPage {
  return locale === 'en' ? page : { ...page, items: localizeProducts(page.items, locale) };
}

export function localizeCategory(c: Category, locale: Locale): Category {
  if (locale === 'en') return c;
  return {
    ...c,
    name: translate(c.name, undefined, locale),
    description: c.description ? translate(c.description, undefined, locale) : c.description,
  };
}

export function localizeSuggestions(s: SearchSuggestions, locale: Locale): SearchSuggestions {
  if (locale === 'en') return s;
  return {
    products: localizeProducts(s.products, locale),
    categories: s.categories.map((c) => localizeCategory(c, locale)),
  };
}

export function localizeReview(r: Review, locale: Locale): Review {
  if (locale === 'en') return r;
  return {
    ...r,
    title: translate(r.title, undefined, locale),
    body: translate(r.body, undefined, locale),
  };
}
