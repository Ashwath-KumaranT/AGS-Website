import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocaleStore } from '@/i18n';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from './authStore';
import { SignInPrompt } from './SignInPrompt';

const profile = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '',
  avatar_url: null,
  created_at: '',
};

function show(route = '/') {
  renderWithProviders(<SignInPrompt />, { route });
  act(() => vi.advanceTimersByTime(1500));
}

describe('SignInPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    useLocaleStore.getState().setLocale('en');
    useAuthStore.setState({ status: 'anonymous', user: null });
  });
  afterEach(() => vi.useRealTimers());

  it('invites signed-out shoppers to sign in or create an account', () => {
    show();
    expect(
      screen.getByRole('dialog', { name: 'Sign in for a better experience' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/sign-in?mode=signup',
    );
  });

  it('stays hidden for the rest of the session once dismissed', () => {
    show();
    act(() => screen.getByRole('button', { name: 'Dismiss sign-in prompt' }).click());
    expect(screen.queryByTestId('signin-prompt')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('atelier-signin-prompt-dismissed')).toBe('1');
  });

  it('is not shown to signed-in users or on the sign-in page', () => {
    useAuthStore.setState({ status: 'authenticated', user: profile });
    show();
    expect(screen.queryByTestId('signin-prompt')).not.toBeInTheDocument();
  });

  it('is not shown on the sign-in page itself', () => {
    show('/sign-in');
    expect(screen.queryByTestId('signin-prompt')).not.toBeInTheDocument();
  });

  it('follows the selected language', () => {
    useLocaleStore.getState().setLocale('ta');
    show();
    expect(screen.getByRole('link', { name: 'உள்நுழை' })).toBeInTheDocument();
  });
});
