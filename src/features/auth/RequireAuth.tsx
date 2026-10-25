import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { useAuthStore } from './authStore';

/** Route guard for account and checkout pages. Preserves the destination for post-login redirect. */
export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  const { t } = useT();

  if (status === 'loading') {
    return (
      <div className="container-page py-16" role="status" aria-label={t('Checking your session')}>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
