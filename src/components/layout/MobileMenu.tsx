import { ChevronRight, Heart, LogOut, Moon, Package, Sun, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useT } from '@/i18n';
import { Drawer } from '@/components/ui/Overlay';
import { useAuthStore } from '@/features/auth/authStore';
import { useSignOut } from '@/features/auth/useSignOut';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { useCategories } from '@/hooks/queries';
import { useThemeStore, useUiStore } from '@/store/uiStore';
import { GENDERS } from './nav';

export function MobileMenu() {
  const open = useUiStore((s) => s.menuOpen);
  const setOpen = useUiStore((s) => s.setMenuOpen);
  const { data: categories = [] } = useCategories();
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useThemeStore();
  const { t } = useT();
  const signOut = useSignOut();
  const close = () => setOpen(false);

  const row =
    'flex min-h-12 items-center justify-between border-b border-border px-5 text-[0.9375rem]';

  return (
    <Drawer open={open} onClose={close} side="left" title={t('Menu')}>
      <nav aria-label={t('Mobile')}>
        <ul>
          <li>
            <Link to="/new-arrivals" onClick={close} className={row}>
              {t('New arrivals')}
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </Link>
          </li>
          {GENDERS.map((g) => (
            <li key={g.id}>
              <details className="group border-b border-border">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-[0.9375rem] [&::-webkit-details-marker]:hidden">
                  {t(g.label)}
                  <ChevronRight
                    className="size-4 text-muted transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <ul className="bg-subtle/60 pb-2">
                  <li>
                    <Link
                      to={g.to}
                      onClick={close}
                      className="flex min-h-11 items-center px-8 text-sm font-medium"
                    >
                      {t('Shop all {label}', { label: t(g.label) })}
                    </Link>
                  </li>
                  {categories
                    .filter((c) => c.parent_id === g.id)
                    .map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/shop/${c.slug}`}
                          onClick={close}
                          className="flex min-h-11 items-center px-8 text-sm text-muted hover:text-fg"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </details>
            </li>
          ))}
          <li>
            <Link to="/sale" onClick={close} className={`${row} text-sale`}>
              {t('Sale')}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </li>
        </ul>

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-sm text-muted">{t('Language')}</span>
          <LanguageToggle />
        </div>
        <ul className="mt-4">
          <li>
            <Link to={user ? '/account' : '/sign-in'} onClick={close} className={row}>
              <span className="flex items-center gap-3">
                <User className="size-[1.125rem]" aria-hidden />
                {user
                  ? t('Hi, {name}', { name: user.name.split(' ')[0] ?? '' })
                  : t('Sign in / Create account')}
              </span>
            </Link>
          </li>
          <li>
            <Link to="/wishlist" onClick={close} className={row}>
              <span className="flex items-center gap-3">
                <Heart className="size-[1.125rem]" aria-hidden />
                {t('Wishlist')}
              </span>
              <WishlistCount />
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/account/orders" onClick={close} className={row}>
                <span className="flex items-center gap-3">
                  <Package className="size-[1.125rem]" aria-hidden />
                  {t('Orders')}
                </span>
              </Link>
            </li>
          )}
          <li>
            <button type="button" onClick={toggle} className={`${row} w-full text-left`}>
              <span className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Sun className="size-[1.125rem]" aria-hidden />
                ) : (
                  <Moon className="size-[1.125rem]" aria-hidden />
                )}
                {theme === 'dark' ? t('Light theme') : t('Dark theme')}
              </span>
            </button>
          </li>
          {user && (
            <li>
              <button
                type="button"
                className={`${row} w-full text-left`}
                onClick={() => {
                  void signOut();
                  close();
                }}
              >
                <span className="flex items-center gap-3">
                  <LogOut className="size-[1.125rem]" aria-hidden />
                  {t('Sign out')}
                </span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </Drawer>
  );
}

function WishlistCount() {
  const n = useWishlistStore((s) => s.ids.length);
  return n > 0 ? <span className="text-sm text-muted">{n}</span> : null;
}
