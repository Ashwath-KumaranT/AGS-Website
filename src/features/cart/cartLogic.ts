import { clampQuantity } from '@/lib/pricing';
import type { CartLine, Cents } from '@/types';

export interface AddInput {
  variantId: string;
  productId: string;
  quantity: number;
  /** current inventory for the variant */
  stock: number;
  /** current catalog price — recorded only so we can warn if it changes */
  price: Cents;
}

export interface AddResult {
  lines: CartLine[];
  /** quantity of the variant now in the (active) cart */
  quantity: number;
  /** true when the request was reduced to fit stock / per-line limit */
  capped: boolean;
}

export function addLine(lines: CartLine[], input: AddInput): AddResult {
  const existing = lines.find((l) => l.variantId === input.variantId);
  const wanted = (existing && !existing.savedForLater ? existing.quantity : 0) + input.quantity;
  const quantity = clampQuantity(wanted, input.stock);
  if (quantity <= 0) return { lines, quantity: 0, capped: true };
  const capped = quantity < wanted;
  if (existing) {
    return {
      lines: lines.map((l) =>
        l.variantId === input.variantId
          ? { ...l, quantity, savedForLater: false, addedPrice: input.price }
          : l,
      ),
      quantity,
      capped,
    };
  }
  return {
    lines: [
      ...lines,
      {
        variantId: input.variantId,
        productId: input.productId,
        quantity,
        savedForLater: false,
        addedPrice: input.price,
      },
    ],
    quantity,
    capped,
  };
}

export function setLineQuantity(
  lines: CartLine[],
  variantId: string,
  quantity: number,
  stock: number,
): CartLine[] {
  const next = clampQuantity(quantity, stock);
  if (next <= 0) return lines.filter((l) => l.variantId !== variantId);
  return lines.map((l) => (l.variantId === variantId ? { ...l, quantity: next } : l));
}

export function removeLine(lines: CartLine[], variantId: string): CartLine[] {
  return lines.filter((l) => l.variantId !== variantId);
}

export function toggleSaved(lines: CartLine[], variantId: string): CartLine[] {
  return lines.map((l) =>
    l.variantId === variantId ? { ...l, savedForLater: !l.savedForLater } : l,
  );
}

export function acknowledgePrice(lines: CartLine[], variantId: string, price: Cents): CartLine[] {
  return lines.map((l) => (l.variantId === variantId ? { ...l, addedPrice: price } : l));
}

export function activeLines(lines: CartLine[]): CartLine[] {
  return lines.filter((l) => !l.savedForLater);
}

export function itemCount(lines: CartLine[]): number {
  return activeLines(lines).reduce((n, l) => n + l.quantity, 0);
}
