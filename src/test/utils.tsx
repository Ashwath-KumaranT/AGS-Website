import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PRODUCTS } from '@/services/mock/seed';
import type { ProductWithVariants } from '@/types';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

export function product(slug: string): ProductWithVariants {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`fixture product ${slug} missing`);
  return structuredClone(p);
}
