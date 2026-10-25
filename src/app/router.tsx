import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation, useRouteError } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorState, Skeleton } from '@/components/ui/primitives';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { useT } from '@/i18n';

// Route-level code splitting: each page is its own chunk.
const HomePage = lazy(() => import('@/pages/HomePage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AccountLayout = lazy(() => import('@/pages/account/AccountLayout'));
const DashboardPage = lazy(() => import('@/pages/account/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'));
const TrackOrderPage = lazy(() => import('@/pages/account/TrackOrderPage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));

const named = <K extends string>(loader: () => Promise<Record<K, ComponentType>>, key: K) =>
  lazy(() => loader().then((m) => ({ default: m[key] })));

const misc = () => import('@/pages/account/MiscAccountPages');
const PaymentMethodsPage = named(misc, 'PaymentMethodsPage');
const CouponsPage = named(misc, 'CouponsPage');
const ReturnsPage = named(misc, 'ReturnsPage');
const NotificationsPage = named(misc, 'NotificationsPage');

const info = () => import('@/pages/InfoPages');
const PrivacyPage = named(info, 'PrivacyPage');
const TermsPage = named(info, 'TermsPage');
const ShippingPage = named(info, 'ShippingPage');
const NotFoundPage = named(info, 'NotFoundPage');

function PageFallback() {
  const { t } = useT();
  return (
    <div className="container-page py-10" role="status" aria-label={t('Loading page')}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-10 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}

function LegacyAuthRedirect({ signup = false }: { signup?: boolean }) {
  const location = useLocation();
  return (
    <Navigate to={signup ? '/sign-in?mode=signup' : '/sign-in'} replace state={location.state} />
  );
}

const page = (node: ReactNode) => <Suspense fallback={<PageFallback />}>{node}</Suspense>;

function RouteError() {
  const error = useRouteError();
  const { t } = useT();
  const chunkFailed =
    error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);
  return (
    <ErrorState
      title={chunkFailed ? t('A new version is available') : t('Something went wrong')}
      message={
        chunkFailed
          ? t('Reload the page to get the latest version of the store.')
          : t('An unexpected error occurred. Please try again.')
      }
      onRetry={() => window.location.reload()}
      className="py-28"
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { path: '/', element: page(<HomePage />) },
          { path: '/shop', element: page(<CatalogPage />) },
          { path: '/shop/:category', element: page(<CatalogPage />) },
          { path: '/men', element: page(<CatalogPage key="men" category="men" />) },
          { path: '/women', element: page(<CatalogPage key="women" category="women" />) },
          { path: '/kids', element: page(<CatalogPage key="kids" category="kids" />) },
          {
            path: '/new-arrivals',
            element: page(<CatalogPage key="new" collection="new-arrivals" />),
          },
          { path: '/sale', element: page(<CatalogPage key="sale" collection="sale" />) },
          { path: '/search', element: page(<CatalogPage key="search" mode="search" />) },
          { path: '/product/:slug', element: page(<ProductDetailPage />) },
          { path: '/cart', element: page(<CartPage />) },
          { path: '/wishlist', element: page(<WishlistPage />) },
          { path: '/sign-in', element: page(<AuthPage />) },
          // old URLs keep working
          { path: '/login', element: <LegacyAuthRedirect /> },
          { path: '/signup', element: <LegacyAuthRedirect signup /> },
          { path: '/forgot-password', element: page(<ForgotPasswordPage />) },
          { path: '/reset-password', element: page(<ResetPasswordPage />) },
          { path: '/privacy', element: page(<PrivacyPage />) },
          { path: '/terms', element: page(<TermsPage />) },
          { path: '/shipping', element: page(<ShippingPage />) },
          {
            element: <RequireAuth />,
            children: [
              { path: '/checkout', element: page(<CheckoutPage />) },
              { path: '/order-confirmation/:id', element: page(<OrderConfirmationPage />) },
              {
                path: '/account',
                element: page(<AccountLayout />),
                children: [
                  { index: true, element: page(<DashboardPage />) },
                  { path: 'profile', element: page(<ProfilePage />) },
                  { path: 'orders', element: page(<OrdersPage />) },
                  { path: 'orders/:id', element: page(<OrderDetailPage />) },
                  { path: 'orders/:id/track', element: page(<TrackOrderPage />) },
                  { path: 'addresses', element: page(<AddressesPage />) },
                  { path: 'payments', element: page(<PaymentMethodsPage />) },
                  { path: 'coupons', element: page(<CouponsPage />) },
                  { path: 'returns', element: page(<ReturnsPage />) },
                  { path: 'notifications', element: page(<NotificationsPage />) },
                ],
              },
            ],
          },
          { path: '*', element: page(<NotFoundPage />) },
        ],
      },
    ],
  },
]);
