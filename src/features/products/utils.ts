import type { ProductVariant, ProductWithVariants } from '@/types';
import type { Swatch } from './ColorSwatches';

export function getSwatches(product: ProductWithVariants): Swatch[] {
  const map = new Map<string, Swatch>();
  product.variants.forEach((v) => {
    const prev = map.get(v.color);
    const soldOut = v.inventory_count <= 0;
    map.set(v.color, {
      name: v.color,
      hex: v.color_hex,
      soldOut: prev ? prev.soldOut && soldOut : soldOut,
    });
  });
  return [...map.values()];
}

export function variantsForColor(product: ProductWithVariants, color: string): ProductVariant[] {
  return product.variants.filter((v) => v.color === color);
}

export function isSoldOut(product: ProductWithVariants): boolean {
  return product.variants.every((v) => v.inventory_count <= 0);
}

export function firstAvailableColor(product: ProductWithVariants): string {
  const available = product.variants.find((v) => v.inventory_count > 0);
  return (available ?? product.variants[0])?.color ?? '';
}

export function totalStock(variants: ProductVariant[]): number {
  return variants.reduce((n, v) => n + v.inventory_count, 0);
}

export function productJsonLd(product: ProductWithVariants, url: string): Record<string, unknown> {
  const inStock = !isSoldOut(product);
  const image = product.variants[0]?.image_urls[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: product.brand },
    material: product.material,
    image: image && !image.startsWith('garment:') ? image : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: import.meta.env.VITE_CURRENCY ?? 'INR',
      price: (product.price / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}
