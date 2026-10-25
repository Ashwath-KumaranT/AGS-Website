import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useProductsByIds } from '@/hooks/queries';
import { translate } from '@/i18n';
import { clampQuantity, computeTotals, getDeliveryOption } from '@/lib/pricing';
import { api } from '@/services';
import { toast, useUiStore } from '@/store/uiStore';
import type { CartLine, Cents, Coupon, ProductWithVariants, ProductVariant, Totals } from '@/types';
import { itemCount } from './cartLogic';
import { useCartStore } from './cartStore';

export interface ResolvedLine {
  line: CartLine;
  product: ProductWithVariants | null;
  variant: ProductVariant | null;
  unitPrice: Cents;
  compareAt: Cents | null;
  stock: number;
  /** variant no longer exists or is sold out */
  unavailable: boolean;
  /** quantity exceeds what's in stock (but some is available) */
  overStock: boolean;
  priceChanged: boolean;
  /** quantity that will actually be purchased */
  effectiveQty: number;
}

export function useCartDetails() {
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);

  const productIds = useMemo(() => [...new Set(lines.map((l) => l.productId))], [lines]);
  const query = useProductsByIds(productIds);

  const resolved: ResolvedLine[] = useMemo(() => {
    const products = query.data ?? [];
    // while a newly added product is being fetched, `query.data` still holds the previous
    // set (keepPreviousData) — judging the new line against it would call it unavailable
    const settled = Boolean(query.data) && !query.isPlaceholderData;
    return lines.map((line) => {
      const product = products.find((p) => p.id === line.productId) ?? null;
      const variant = product?.variants.find((v) => v.id === line.variantId) ?? null;
      const known = Boolean(variant);
      const stock = variant?.inventory_count ?? 0;
      const unitPrice = variant?.price ?? line.addedPrice;
      return {
        line,
        product,
        variant,
        unitPrice,
        compareAt: product?.compare_at_price ?? null,
        stock,
        unavailable: settled && (!variant || stock <= 0),
        overStock: known && stock > 0 && line.quantity > stock,
        priceChanged: known && unitPrice !== line.addedPrice,
        effectiveQty: known ? clampQuantity(line.quantity, stock) : line.quantity,
      };
    });
  }, [lines, query.data, query.isPlaceholderData]);

  const active = useMemo(() => resolved.filter((r) => !r.line.savedForLater), [resolved]);
  const saved = useMemo(() => resolved.filter((r) => r.line.savedForLater), [resolved]);
  const purchasable = useMemo(() => active.filter((r) => !r.unavailable), [active]);

  const subtotal = purchasable.reduce((s, r) => s + r.unitPrice * r.effectiveQty, 0);

  const couponQuery = useQuery({
    queryKey: ['coupon-check', couponCode, subtotal],
    queryFn: () => api.checkout.validateCoupon(couponCode as string, subtotal),
    enabled: Boolean(couponCode) && subtotal > 0,
    staleTime: 15_000,
  });
  const coupon: Coupon | null = couponQuery.data?.valid ? couponQuery.data.coupon : null;
  const couponError = couponQuery.data && !couponQuery.data.valid ? couponQuery.data.reason : null;

  const totals: Totals = useMemo(
    () =>
      computeTotals({
        lines: purchasable.map((r) => ({
          unitPrice: r.unitPrice,
          compareAtPrice: r.compareAt,
          quantity: r.effectiveQty,
        })),
        coupon,
        delivery: getDeliveryOption('standard'),
      }),
    [purchasable, coupon],
  );

  return {
    resolved,
    active,
    saved,
    purchasable,
    totals,
    coupon,
    couponCode,
    couponError,
    couponChecking: couponQuery.isFetching,
    count: itemCount(lines),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    // an over-stock line is bought at `effectiveQty` and says so in the bag, so it doesn't
    // block checkout — only a line that can't be bought at all does
    hasIssues: active.some((r) => r.unavailable),
  };
}

export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const openCart = useUiStore((s) => s.openCart);

  return useCallback(
    (
      product: ProductWithVariants,
      variant: ProductVariant,
      quantity = 1,
      opts?: { openDrawer?: boolean },
    ) => {
      if (variant.inventory_count <= 0) {
        toast.error(
          translate('Sold out'),
          translate('{title} in {color}, {size} is unavailable.', {
            title: product.title,
            color: translate(variant.color),
            size: variant.size,
          }),
        );
        return false;
      }
      const result = add({
        variantId: variant.id,
        productId: product.id,
        quantity,
        stock: variant.inventory_count,
        price: variant.price,
      });
      if (result.capped) {
        toast.info(
          translate('Quantity adjusted'),
          translate('Only {count} available for this size.', { count: result.quantity }),
        );
      }
      if (opts?.openDrawer !== false) openCart();
      return true;
    },
    [add, openCart],
  );
}
