import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/features/cart/cartStore';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { product, renderWithProviders } from '@/test/utils';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
    useWishlistStore.getState().clear();
  });

  it('shows title, brand, price, discount badge and colour options', () => {
    renderWithProviders(<ProductCard product={product('pocket-tee')} />);
    expect(screen.getByRole('link', { name: 'Everyday Pocket Tee' })).toHaveAttribute(
      'href',
      '/product/pocket-tee',
    );
    expect(screen.getByText('−27%')).toBeInTheDocument();
    expect(screen.getByText('₹1,099')).toBeInTheDocument();
    expect(screen.getByText('₹1,499')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Navy' })).toBeInTheDocument();
  });

  it('marks fully sold-out products and hides quick add', () => {
    renderWithProviders(<ProductCard product={product('waxed-cotton-jacket')} />);
    expect(screen.getByText('Sold out')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /quick add/i })).not.toBeInTheDocument();
  });

  it('quick-adds the chosen size to the cart', async () => {
    const user = userEvent.setup();
    const p = product('heavyweight-crew-tee');
    renderWithProviders(<ProductCard product={p} />);
    await user.click(screen.getByRole('button', { name: /quick add/i }));
    const firstAvailable = p.variants.find((v) => v.color === 'Ivory' && v.inventory_count > 0);
    await user.click(
      screen.getByRole('button', { name: `Add size ${firstAvailable?.size} to cart` }),
    );
    expect(useCartStore.getState().lines).toEqual([
      expect.objectContaining({ variantId: firstAvailable?.id, quantity: 1 }),
    ]);
  });

  it('toggles the wishlist heart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={product('pocket-tee')} />);
    const heart = screen.getByRole('button', { name: /add everyday pocket tee to wishlist/i });
    await user.click(heart);
    expect(useWishlistStore.getState().ids).toEqual(['p_pocket-tee']);
    expect(
      screen.getByRole('button', { name: /remove everyday pocket tee from wishlist/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
