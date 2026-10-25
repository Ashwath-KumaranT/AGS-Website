import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from '@/store/uiStore';
import { product, renderWithProviders } from '@/test/utils';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from './cartStore';

describe('CartDrawer save for later', () => {
  beforeEach(() => {
    const p = product('boxy-cotton-tee');
    const v = p.variants.find((x) => x.inventory_count > 0);
    if (!v) throw new Error('fixture needs stock');
    useCartStore.setState({
      lines: [
        {
          variantId: v.id,
          productId: p.id,
          quantity: 1,
          savedForLater: false,
          addedPrice: v.price,
        },
      ],
      couponCode: null,
    });
    useUiStore.setState({ cartOpen: true });
  });

  it('keeps a saved item visible in the drawer and lets it move back to the bag', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartDrawer />);

    const bag = await screen.findByRole('list', { name: 'Items in your bag' });
    await user.click(within(bag).getByRole('button', { name: 'Save for later' }));

    const saved = await screen.findByRole('list', { name: 'Saved for later' });
    expect(within(saved).getByText('Boxy Cotton Tee')).toBeInTheDocument();
    expect(screen.getByText('Saved for later (1)')).toBeInTheDocument();
    expect(screen.queryByText('Start shopping')).not.toBeInTheDocument();

    await user.click(within(saved).getByRole('button', { name: 'Move to bag' }));
    expect(await screen.findByRole('list', { name: 'Items in your bag' })).toBeInTheDocument();
    expect(useCartStore.getState().lines[0]?.savedForLater).toBe(false);
  });
});
