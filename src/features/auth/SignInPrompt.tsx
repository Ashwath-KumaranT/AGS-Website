import { UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { useAuthStore } from './authStore';

const DISMISS_KEY = 'atelier-signin-prompt-dismissed';
const SHOW_DELAY_MS = 1200;
/** pages where the prompt would be redundant or distracting */
const HIDDEN_ON = [
  '/sign-in',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/checkout',
];

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Popup at the top of the site for shoppers who aren't signed in. Dismissing it
 * hides it for the rest of the browser session.
 */
export function SignInPrompt() {
  const { t } = useT();
  const status = useAuthStore((s) => s.status);
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const hiddenHere = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (status !== 'anonymous' || dismissed || !ready || hiddenHere) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage unavailable: hide for this page view only */
    }
  };

  const from = { from: pathname };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[6.5rem] z-[60] flex justify-center px-3 md:top-[6.75rem] md:justify-end md:px-6">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="signin-prompt-title"
        aria-describedby="signin-prompt-body"
        className="animate-slide-up pointer-events-auto w-full max-w-sm rounded-[6px] border border-border bg-bg p-5 shadow-2xl"
        data-testid="signin-prompt"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-accent">
            <UserRound className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="signin-prompt-title" className="font-display text-xl leading-snug">
              {t('Sign in for a better experience')}
            </h2>
            <p id="signin-prompt-body" className="mt-1 text-sm text-muted">
              {t('Track orders, keep your wishlist and check out faster.')}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('Dismiss sign-in prompt')}
            className="-mr-2 -mt-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to="/sign-in"
            state={from}
            onClick={dismiss}
            className={buttonVariants({ size: 'md' })}
          >
            {t('Sign in')}
          </Link>
          <Link
            to="/sign-in?mode=signup"
            state={from}
            onClick={dismiss}
            className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
          >
            {t('Create account')}
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full text-center text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {t('Not now')}
        </button>
      </section>
    </div>
  );
}
