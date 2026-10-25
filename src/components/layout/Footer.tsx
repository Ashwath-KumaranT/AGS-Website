import { Lock, RotateCcw, Truck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n';
import { toast } from '@/store/uiStore';

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'New arrivals', to: '/new-arrivals' },
      { label: 'Women', to: '/women' },
      { label: 'Men', to: '/men' },
      { label: 'Kids', to: '/kids' },
      { label: 'Sale', to: '/sale' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track an order', to: '/account/orders' },
      { label: 'Returns & refunds', to: '/account/returns' },
      { label: 'Shipping information', to: '/shipping' },
      { label: 'Size guide', to: '/shop' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/sign-in' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Addresses', to: '/account/addresses' },
      { label: 'Coupons', to: '/account/coupons' },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { t, tm } = useT();

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setEmail('');
    toast.success('You’re on the list', 'Use WELCOME10 for 10% off your first order.');
  };

  return (
    <footer className="mt-24 border-t border-border bg-subtle/60 pb-24 md:pb-0">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <p className="font-display text-2xl tracking-[0.2em]">ASG</p>
          <p className="mt-1 text-sm font-medium tracking-wide">{t('Arun Sakthi Garments')}</p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            {t(
              'Considered essentials, made to last. Join our list for early access to new arrivals and 10% off your first order.',
            )}
          </p>
          <form onSubmit={subscribe} className="mt-5 flex max-w-sm items-start gap-2" noValidate>
            <div className="flex-1">
              <label htmlFor="newsletter" className="sr-only">
                {t('Email address')}
              </label>
              <input
                id="newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Email address')}
                autoComplete="email"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="h-11 w-full rounded-[3px] border border-border-strong bg-surface px-3.5 text-sm focus:border-fg focus:outline-none"
              />
              {error && (
                <p id="newsletter-error" role="alert" className="mt-1 text-xs text-sale">
                  {tm(error)}
                </p>
              )}
            </div>
            <Button type="submit">{t('Subscribe')}</Button>
          </form>
        </div>
        <nav aria-label={t('Footer')} className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-3 text-fg">{t(col.title)}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="inline-flex min-h-9 items-center text-sm text-muted hover:text-fg hover:underline underline-offset-4"
                    >
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <ul className="container-page grid gap-4 py-6 text-sm text-muted sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <Truck className="size-5 shrink-0" aria-hidden />{' '}
            {t('Free shipping on orders over ₹1,999')}
          </li>
          <li className="flex items-center gap-3">
            <RotateCcw className="size-5 shrink-0" aria-hidden /> {t('Free returns within 7 days')}
          </li>
          <li className="flex items-center gap-3">
            <Lock className="size-5 shrink-0" aria-hidden /> {t('Secure, encrypted payments')}
          </li>
        </ul>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            {t('© {year} ASG — Arun Sakthi Garments. All rights reserved.', {
              year: new Date().getFullYear(),
            })}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link to="/privacy" className="hover:text-fg hover:underline underline-offset-4">
                {t('Privacy')}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-fg hover:underline underline-offset-4">
                {t('Terms')}
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-fg hover:underline underline-offset-4">
                {t('Shipping & returns')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
