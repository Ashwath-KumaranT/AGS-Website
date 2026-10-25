import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/primitives';
import { useCartStore } from '@/features/cart/cartStore';
import ProductDetailPage from './ProductDetailPage';

function renderPdp(slug: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetailPage />} />
        </Routes>
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductDetailPage add to bag', () => {
  beforeEach(() => useCartStore.getState().clear());

  it('asks for a size instead of silently doing nothing', async () => {
    const user = userEvent.setup();
    renderPdp('wrap-midi-dress');
    await user.click(await screen.findByTestId('add-to-cart'));
    expect(screen.getByText('Please select a size.')).toBeInTheDocument();
    expect(screen.getByText('Choose a size first')).toBeInTheDocument();
    expect(useCartStore.getState().lines).toEqual([]);
  });

  it('adds the selected colour and size to the bag', async () => {
    const user = userEvent.setup();
    renderPdp('wrap-midi-dress');
    const size = await screen.findByRole('radio', { name: /^Size M/ });
    await user.click(size);
    await user.click(screen.getByTestId('add-to-cart'));
    expect(useCartStore.getState().lines).toEqual([
      expect.objectContaining({
        productId: 'p_wrap-midi-dress',
        quantity: 1,
        savedForLater: false,
      }),
    ]);
    expect(useCartStore.getState().lines[0]?.variantId).toMatch(/_m$/);
  });
});
