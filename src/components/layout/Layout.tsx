import { WifiOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { useAuthStore } from '@/features/auth/authStore';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { useWishlistSync } from '@/features/wishlist/hooks';
import { useOnline } from '@/hooks/useOnline';
import { useT } from '@/i18n';
import { Toaster } from '@/components/ui/primitives';
import { useUiStore } from '@/store/uiStore';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';
import { SearchPanel } from './SearchPanel';

const ANNOUNCEMENTS = [
  'Free shipping on orders over ₹1,999',
  'Free returns within 7 days',
  'New season arrivals — shop the edit',
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  const { t } = useT();
  useEffect(() => {
    const timer = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 4500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="bg-fg text-bg" role="region" aria-label={t('Announcements')}>
      <p
        key={i}
        className="animate-fade-in container-page flex h-9 items-center justify-center text-center text-[0.75rem] font-medium tracking-wide"
      >
        {t(ANNOUNCEMENTS[i] ?? '')}
      </p>
    </div>
  );
}

function SessionExpiredBanner() {
  const expired = useAuthStore((s) => s.sessionExpired);
  const clear = useAuthStore((s) => s.clearExpiredFlag);
  const { t } = useT();
  if (!expired) return null;
  // the link sits mid-sentence, so split the translated sentence around it
  const [before = '', after = ''] = t('Your session expired. {link} to continue.').split('{link}');
  return (
    <div role="alert" className="bg-warning/15 text-warning">
      <div className="container-page flex items-center justify-between gap-3 py-2 text-sm">
        <p>
          {before}
          <Link to="/sign-in" className="font-medium underline underline-offset-4">
            {t('Sign in again')}
          </Link>
          {after}
        </p>
        <button
          type="button"
          aria-label={t('Dismiss')}
          onClick={clear}
          className="inline-flex size-9 items-center justify-center"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function OfflineBanner() {
  const online = useOnline();
  const { t } = useT();
  if (online) return null;
  return (
    <div role="alert" className="bg-sale text-white">
      <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-sm">
        <WifiOff className="size-4" aria-hidden />
        {t('You’re offline. Some actions won’t work until you reconnect.')}
      </p>
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const closeAll = useUiStore((s) => s.setMenuOpen);
  const { t } = useT();
  useWishlistSync();

  // reset scroll and move focus to the page on navigation (screen-reader friendly)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    closeAll(false);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, closeAll]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[300] focus:rounded-[3px] focus:bg-fg focus:px-4 focus:py-2.5 focus:text-bg"
      >
        {t('Skip to content')}
      </a>
      <OfflineBanner />
      <SessionExpiredBanner />
      <AnnouncementBar />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <MobileMenu />
      <SearchPanel />
      <Toaster />
      <SignInPrompt />
    </div>
  );
}
