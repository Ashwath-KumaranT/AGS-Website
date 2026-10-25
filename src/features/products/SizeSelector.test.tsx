import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ProductVariant } from '@/types';
import { SizeSelector } from './SizeSelector';

const v = (size: string, inventory_count: number): ProductVariant => ({
  id: `v-${size}`,
  product_id: 'p',
  color: 'Ivory',
  color_hex: '#fff',
  size,
  sku: size,
  price: 1000,
  inventory_count,
  image_urls: [],
});

describe('SizeSelector', () => {
  const variants = [v('S', 5), v('M', 0), v('L', 2)];

  it('renders sizes as radios and disables sold-out sizes', () => {
    render(<SizeSelector variants={variants} value={null} onChange={() => undefined} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Size M, sold out' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Size L, only 2 left' })).toBeEnabled();
  });

  it('reports the selected size and supports keyboard selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SizeSelector variants={variants} value={null} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Size S' }));
    expect(onChange).toHaveBeenCalledWith('S');
    await user.click(screen.getByRole('radio', { name: 'Size M, sold out' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reflects the controlled value', () => {
    render(<SizeSelector variants={variants} value="L" onChange={() => undefined} />);
    expect(screen.getByRole('radio', { name: /Size L/ })).toBeChecked();
  });
});
