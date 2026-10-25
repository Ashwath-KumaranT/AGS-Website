import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Header } from '@/components/layout/Header';
import { useLocaleStore } from '@/i18n';
import { renderWithProviders } from '@/test/utils';

describe('Language toggle', () => {
  beforeEach(() => useLocaleStore.getState().setLocale('en'));

  it('defaults to English', () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId('lang-en')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('link', { name: 'Sale' }).length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('en');
  });

  it('switches the site to Tamil and back, and remembers the choice', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    await user.click(screen.getByTestId('lang-ta'));
    expect(screen.getByTestId('lang-ta')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('link', { name: 'தள்ளுபடி' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'பெண்கள்' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ta');
    expect(JSON.parse(localStorage.getItem('atelier-locale') ?? '{}').state.locale).toBe('ta');

    await user.click(screen.getByTestId('lang-en'));
    expect(screen.getAllByRole('link', { name: 'Sale' }).length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('en');
  });
});
