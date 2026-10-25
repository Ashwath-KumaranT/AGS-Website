import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { itemCount } from '@/features/cart/cartLogic';
import { useWishlistStore } from '@/features/wishlist/wishlistStore';
import { useCategories } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import { useThemeStore, useUiStore } from '@/store/uiStore';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ProductImage } from '@/components/ui/ProductImage';
import { useT } from '@/i18n';
import type { Category } from '@/types';
import { GENDERS } from './nav';

function Badge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label}
      className="absolute right-1 top-1 flex min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold leading-[1.125rem] text-accent-fg"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

const iconBtn =
  'relative inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-subtle';

function MegaMenu({
  genderId,
  label,
  categories,
}: {
  genderId: string;
  label: string;
  categories: Category[];
}) {
  const { t } = useT();
  const children = categories.filter((c) => c.parent_id === genderId);
  const feature = categories.find((c) => c.id === genderId);
  return (
    <div className="invisible absolute inset-x-0 top-full z-40 translate-y-1 border-y border-border bg-bg opacity-0 shadow-soft transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="container-page grid grid-cols-[1fr_1fr_20rem] gap-10 py-8">
        <div>
          <p className="eyebrow mb-4">{t('Shop {label}', { label })}</p>
          <ul className="space-y-0.5">
            {children.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop/${c.slug}`}
                  className="inline-flex min-h-9 items-center text-sm hover:text-accent hover:underline underline-offset-4"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={`/${genderId}`}
                className="inline-flex min-h-9 items-center text-sm font-medium underline underline-offset-4 hover:text-accent"
              >
                {t('View all {label}', { label })}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">{t('Featured')}</p>
          <ul className="space-y-0.5">
            <li>
              <Link
                to={`/new-arrivals?cat=${genderId}`}
                className="inline-flex min-h-9 items-center text-sm hover:text-accent hover:underline underline-offset-4"
              >
                {t('New arrivals')}
              </Link>
            </li>
            <li>
              <Link
                to={`/shop/${genderId}?sort=rating`}
                className="inline-flex min-h-9 items-center text-sm hover:text-accent hover:underline underline-offset-4"
              >
                {t('Top rated')}
              </Link>
            </li>
            <li>
              <Link
                to={`/sale?cat=${genderId}`}
                className="inline-flex min-h-9 items-center text-sm text-sale hover:underline underline-offset-4"
              >
                {t('Sale')}
              </Link>
            </li>
          </ul>
        </div>
        {feature && (
          <Link
            to={`/${genderId}`}
            className="group/tile relative block overflow-hidden rounded-[4px]"
            tabIndex={-1}
            aria-hidden
          >
            <ProductImage src={feature.image_url} alt="" className="aspect-[16/10] w-full" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-display text-xl text-white">
              {t('{label} — the edit', { label })}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const { data: categories = [] } = useCategories();
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => itemCount(s.lines));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { openCart, setMenuOpen, setSearchOpen } = useUiStore();
  const { theme, toggle } = useThemeStore();
  const { t } = useT();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative inline-flex h-16 items-center px-2.5 text-[0.8125rem] xl:px-3.5 font-medium uppercase tracking-[0.12em] transition-colors hover:text-accent',
      'after:absolute after:inset-x-2.5 xl:after:inset-x-3.5 after:bottom-4 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:after:scale-x-100',
      isActive && 'after:scale-x-100',
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
      <div className="container-page relative flex h-16 items-center justify-between gap-2">
        <div className="flex flex-1 items-center lg:hidden">
          <button
            type="button"
            className={cn(iconBtn, '-ml-2')}
            aria-label={t('Open menu')}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-[1.375rem]" aria-hidden />
          </button>
        </div>

        <Link
          to="/"
          className="shrink-0 font-display text-[1.375rem] font-medium tracking-[0.16em] xs:text-[1.5rem] xs:tracking-[0.18em] sm:text-[1.75rem] sm:tracking-[0.24em] lg:mr-4 xl:mr-6"
          aria-label={t('ASG — home')}
          title={t('Arun Sakthi Garments')}
        >
          ASG
        </Link>

        <nav aria-label={t('Primary')} className="hidden flex-1 lg:block">
          <ul className="flex items-center">
            <li>
              <NavLink to="/new-arrivals" className={linkClass}>
                {t('New')}
              </NavLink>
            </li>
            {GENDERS.map((g) => (
              <li key={g.id} className="group static">
                <NavLink to={g.to} className={linkClass}>
                  {t(g.label)}
                </NavLink>
                <MegaMenu genderId={g.id} label={t(g.label)} categories={categories} />
              </li>
            ))}
            <li>
              <NavLink to="/sale" className={(s) => cn(linkClass(s), 'text-sale')}>
                {t('Sale')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 lg:flex-none">
          <LanguageToggle className="xs:mr-1" />
          <button
            type="button"
            className={cn(iconBtn, 'hidden md:inline-flex')}
            aria-label={t('Search')}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(iconBtn, 'hidden md:inline-flex')}
            aria-label={theme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')}
            onClick={toggle}
          >
            {theme === 'dark' ? (
              <Sun className="size-5" aria-hidden />
            ) : (
              <Moon className="size-5" aria-hidden />
            )}
          </button>
          <Link
            to={user ? '/account' : '/sign-in'}
            className={cn(iconBtn, 'hidden md:inline-flex')}
            aria-label={user ? t('My account') : t('Sign in')}
          >
            <User className="size-5" aria-hidden />
          </Link>
          <Link
            to="/wishlist"
            className={cn(iconBtn, 'hidden md:inline-flex')}
            aria-label={t('Wishlist')}
          >
            <Heart className="size-5" aria-hidden />
            <Badge count={wishCount} label={t('{count} saved items', { count: wishCount })} />
          </Link>
          <button
            type="button"
            className={cn(iconBtn, '-mr-2 md:mr-0')}
            aria-label={t('Open bag, {count} items', { count: cartCount })}
            onClick={openCart}
            data-testid="cart-button"
          >
            <ShoppingBag className="size-5" aria-hidden />
            <Badge count={cartCount} label={t('{count} items in bag', { count: cartCount })} />
          </button>
        </div>
      </div>
    </header>
  );
}
