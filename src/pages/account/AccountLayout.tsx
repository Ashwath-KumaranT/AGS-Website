import {
  Bell,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Tag,
  User,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useSignOut } from '@/features/auth/useSignOut';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const NAV = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/payments', label: 'Payment methods', icon: CreditCard },
  { to: '/account/coupons', label: 'Coupons', icon: Tag },
  { to: '/account/returns', label: 'Returns & refunds', icon: RotateCcw },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
];

export default function AccountLayout() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  if (!user) return null;

  return (
    <div className="container-page py-6 md:py-10">
      <div className="mb-8 flex items-center gap-4">
        <span
          className="flex size-14 items-center justify-center rounded-full bg-fg font-display text-xl text-bg"
          aria-hidden
        >
          {initials(user.name)}
        </span>
        <div>
          <p className="eyebrow">{t('My account')}</p>
          <p className="font-display text-2xl">{user.name}</p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <nav
          aria-label={t('Account')}
          className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0"
        >
          <ul className="flex gap-1 lg:flex-col">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 whitespace-nowrap rounded-[4px] px-3 text-sm transition-colors',
                      isActive ? 'bg-fg text-bg' : 'hover:bg-subtle',
                    )
                  }
                >
                  <Icon className="size-[1.125rem]" aria-hidden />
                  {t(label)}
                </NavLink>
              </li>
            ))}
            <li className="shrink-0 lg:mt-4 lg:border-t lg:border-border lg:pt-4">
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex min-h-11 w-full items-center gap-3 whitespace-nowrap rounded-[4px] px-3 text-sm text-muted hover:bg-subtle hover:text-fg"
              >
                <LogOut className="size-[1.125rem]" aria-hidden />
                {t('Sign out')}
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
