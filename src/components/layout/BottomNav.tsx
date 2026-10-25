import { Heart, Home, Search, ShoppingBag, User, Store } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { itemCount } from '@/features/cart/cartLogic';
import { useCartStore } from '@/features/cart/cartStore';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/store/uiStore';

const item =
  'relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6562rem] font-medium text-muted transition-colors';

/** Thumb-friendly navigation for phones (hidden from md up). */
export function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => itemCount(s.lines));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { openCart, setSearchOpen } = useUiStore();
  const { t } = useT();
  const active = ({ isActive }: { isActive: boolean }) => cn(item, isActive && 'text-fg');

  const count = (n: number) =>
    n > 0 ? (
      <span className="absolute left-1/2 top-1.5 ml-2 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.5625rem] font-semibold leading-4 text-accent-fg">
        {n > 99 ? '99+' : n}
      </span>
    ) : null;

  return (
    <nav
      aria-label={t('Quick navigation')}
      className="fixed inset-x-0 bottom-0 z-40 flex h-[3.75rem] border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      style={{ boxSizing: 'content-box' }}
    >
      <NavLink to="/" end className={active}>
        <Home className="size-5" aria-hidden />
        {t('Home')}
      </NavLink>
      <NavLink to="/shop" className={active}>
        <Store className="size-5" aria-hidden />
        {t('Shop')}
      </NavLink>
      <button type="button" className={item} onClick={() => setSearchOpen(true)}>
        <Search className="size-5" aria-hidden />
        {t('Search')}
      </button>
      <NavLink to="/wishlist" className={active}>
        <Heart className="size-5" aria-hidden />
        {t('Wishlist|short')}
        {count(wishCount)}
      </NavLink>
      <button
        type="button"
        className={item}
        onClick={openCart}
        aria-label={
          cartCount === 1
            ? t('Bag, {count} item', { count: cartCount })
            : t('Bag, {count} items', { count: cartCount })
        }
      >
        <ShoppingBag className="size-5" aria-hidden />
        {t('Bag')}
        {count(cartCount)}
      </button>
      <NavLink to={user ? '/account' : '/sign-in'} className={active}>
        <User className="size-5" aria-hidden />
        {user ? t('Account') : t('Sign in')}
      </NavLink>
    </nav>
  );
}
