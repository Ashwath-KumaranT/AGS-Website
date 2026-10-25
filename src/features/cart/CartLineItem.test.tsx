import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { product, renderWithProviders } from '@/test/utils';
import { CartLineItem } from './CartLineItem';
import { useCartStore } from './cartStore';
import type { ResolvedLine } from './hooks';

function resolved(overrides: Partial<ResolvedLine> = {}): ResolvedLine {
  const p = product('heavyweight-crew-tee');
  const variant = { ...(p.variants[0] as (typeof p.variants)[number]), inventory_count: 4 };
  const line = {
    variantId: variant.id,
    productId: p.id,
    quantity: 2,
    savedForLater: false,
    addedPrice: variant.price,
  };
  return {
    line,
    product: p,
    variant,
    unitPrice: variant.price,
    compareAt: null,
    stock: 4,
    unavailable: false,
    overStock: false,
    priceChanged: false,
    effectiveQty: 2,
    ...overrides,
  };
}

describe('CartLineItem', () => {
  beforeEach(() => {
    const r = resolved();
    useCartStore.setState({ lines: [r.line], couponCode: null });
  });

  it('shows variant details and line total', () => {
    renderWithProviders(
      <ul>
        <CartLineItem item={resolved()} />
      </ul>,
    );
    expect(screen.getByText('Heavyweight Crew Tee')).toBeInTheDocument();
    expect(screen.getByText(/Ivory · Size XS/)).toBeInTheDocument();
    expect(screen.getByText('₹2,598')).toBeInTheDocument();
    expect(screen.getByText('₹1,299 each')).toBeInTheDocument();
  });

  it('changes quantity within stock and removes the line', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ul>
        <CartLineItem item={resolved()} />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
    await user.click(screen.getByRole('button', { name: /remove heavyweight crew tee/i }));
    expect(useCartStore.getState().lines).toEqual([]);
  });

  it('moves the item to saved for later', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ul>
        <CartLineItem item={resolved()} />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(useCartStore.getState().lines[0]?.savedForLater).toBe(true);
  });

  it('warns about sold-out items and price changes', () => {
    renderWithProviders(
      <ul>
        <CartLineItem item={resolved({ unavailable: true, stock: 0 })} />
        <CartLineItem item={resolved({ priceChanged: true, unitPrice: 3500 })} />
      </ul>,
    );
    expect(screen.getByText(/this item is sold out/i)).toBeInTheDocument();
    expect(screen.getByText(/price changed from ₹1,299 to ₹35/i)).toBeInTheDocument();
  });
});
