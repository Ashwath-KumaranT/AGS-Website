import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddressForm } from '@/features/account/AddressForm';
import { PaymentForm } from './PaymentForm';

describe('AddressForm', () => {
  it('shows field errors and does not submit an incomplete address', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save address' }));
    expect(await screen.findByText('Enter the recipient name')).toBeInTheDocument();
    expect(screen.getByText('Enter your street address')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid address', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Phone'), '+1 415 555 0100');
    await user.type(screen.getByLabelText('Address line 1'), '1 Market St');
    await user.type(screen.getByLabelText('State / region'), 'CA');
    await user.type(screen.getByLabelText('City'), 'San Francisco');
    await user.type(screen.getByLabelText('Postal code'), '94105');
    await user.click(screen.getByRole('button', { name: 'Save address' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: 'Ada Lovelace',
      postal_code: '94105',
      country: 'US',
    });
  });
});

describe('PaymentForm', () => {
  it('formats card input and validates before paying', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PaymentForm total={4604} loading={false} onSubmit={onSubmit} mode="inline-card" />);
    const number = screen.getByLabelText('Card number');
    await user.type(number, '4242424242424241');
    expect(number).toHaveValue('4242 4242 4242 4241');
    await user.click(screen.getByTestId('pay-button'));
    expect(await screen.findByText('Enter a valid card number')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid card details', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PaymentForm total={4604} loading={false} onSubmit={onSubmit} mode="inline-card" />);
    expect(screen.getByTestId('pay-button')).toHaveTextContent('Pay ₹46.04');
    await user.type(screen.getByLabelText('Card number'), '4242424242424242');
    await user.type(screen.getByLabelText('Name on card'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Expiry (MM/YY)'), '1230');
    await user.type(screen.getByLabelText('Security code'), '123');
    await user.click(screen.getByTestId('pay-button'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      number: '4242 4242 4242 4242',
      name: 'Ada Lovelace',
      expiry: '12/30',
      cvc: '123',
    });
  });
});
