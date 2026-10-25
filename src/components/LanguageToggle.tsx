import { Languages } from 'lucide-react';
import { LOCALES, useLocaleStore, useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** EN | தமிழ் segmented switch. English is the default; the choice is remembered. */
export function LanguageToggle({
  className,
  showIcon = false,
}: {
  className?: string;
  showIcon?: boolean;
}) {
  const { t, locale } = useT();
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      role="radiogroup"
      aria-label={t('Choose language')}
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border-strong p-0.5 xs:gap-1',
        className,
      )}
    >
      {showIcon && <Languages className="ml-1.5 size-4 text-muted" aria-hidden />}
      {LOCALES.map((l) => {
        const active = l.id === locale;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l.htmlLang}
            onClick={() => setLocale(l.id)}
            className={cn(
              'inline-flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-[0.6875rem] font-medium transition-colors xs:h-8 xs:min-w-10 xs:px-2.5 xs:text-xs',
              active ? 'bg-fg text-bg' : 'text-muted hover:text-fg',
            )}
            data-testid={`lang-${l.id}`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
