import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useLocaleStore } from '@/i18n';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from '@/services/mock/db';
import AuthPage from './AuthPage';

function renderAuth(route = '/sign-in') {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/account" element={<p>Account home</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    useLocaleStore.getState().setLocale('en');
    useAuthStore.setState({ status: 'anonymous', user: null });
  });

  it('switches between the sign-in and create-account tabs', async () => {
    const user = userEvent.setup();
    renderAuth();
    expect(screen.getByRole('tab', { name: 'Sign in' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Create account' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
  });

  it('opens on the create-account tab from ?mode=signup', () => {
    renderAuth('/sign-in?mode=signup');
    expect(screen.getByRole('tab', { name: 'Create account' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('signs in and goes to the account page', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText('Email'), DEMO_USER_EMAIL);
    await user.type(screen.getByLabelText('Password'), DEMO_USER_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Account home')).toBeInTheDocument();
  });

  it('shows validation errors in Tamil when Tamil is selected', async () => {
    const user = userEvent.setup();
    useLocaleStore.getState().setLocale('ta');
    renderAuth();
    expect(screen.getByRole('heading', { level: 1, name: 'உள்நுழை' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'உள்நுழை' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((a) => /[஀-௿]/.test(a.textContent ?? ''))).toBe(true);
  });
});
