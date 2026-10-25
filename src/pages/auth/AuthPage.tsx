import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { AuthShell } from '@/features/auth/AuthShell';
import { SignInForm, SignUpForm } from '@/features/auth/AuthForms';
import { useAuthStore } from '@/features/auth/authStore';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

type Mode = 'signin' | 'signup';

/** One page for both flows: /sign-in and /sign-in?mode=signup. */
export default function AuthPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const from = (location.state as { from?: string } | null)?.from ?? '/account';
  const status = useAuthStore((s) => s.status);

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const setMode = (next: Mode) =>
    setParams(next === 'signup' ? { mode: 'signup' } : {}, {
      replace: true,
      state: location.state,
    });
  const done = () => navigate(from, { replace: true });

  const subtitle =
    mode === 'signup'
      ? t('Save your bag, track orders and check out faster.')
      : from.startsWith('/checkout')
        ? t('Sign in to complete your order. Your bag is saved.')
        : t('Welcome back.');

  const tabs: { id: Mode; label: string }[] = [
    { id: 'signin', label: t('Sign in') },
    { id: 'signup', label: t('Create account') },
  ];

  return (
    <AuthShell
      title={mode === 'signup' ? t('Create account') : t('Sign in')}
      subtitle={subtitle}
      footer={
        <>
          {mode === 'signup' ? t('Already have an account?') : t('New to ASG?')}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="font-medium text-fg underline underline-offset-4"
          >
            {mode === 'signup' ? t('Sign in') : t('Create account')}
          </button>
        </>
      }
    >
      <Seo title={mode === 'signup' ? t('Create account') : t('Sign in')} noindex />
      <div
        role="tablist"
        aria-label={t('Account options')}
        className="mb-6 grid grid-cols-2 rounded-full border border-border-strong p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`auth-tab-${tab.id}`}
            aria-selected={mode === tab.id}
            aria-controls={`auth-panel-${tab.id}`}
            onClick={() => setMode(tab.id)}
            className={cn(
              'h-10 rounded-full text-sm font-medium transition-colors',
              mode === tab.id ? 'bg-fg text-bg' : 'text-muted hover:text-fg',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`auth-panel-${mode}`} aria-labelledby={`auth-tab-${mode}`}>
        {mode === 'signup' ? <SignUpForm onSuccess={done} /> : <SignInForm onSuccess={done} />}
      </div>
    </AuthShell>
  );
}
