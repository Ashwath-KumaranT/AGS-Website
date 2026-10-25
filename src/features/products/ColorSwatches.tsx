import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export interface Swatch {
  name: string;
  hex: string;
  soldOut?: boolean;
}

/** Radio-group colour picker (large swatches, used on the product page). */
export function ColorSwatches({
  swatches,
  value,
  onChange,
  name = 'color',
}: {
  swatches: Swatch[];
  value: string;
  onChange: (color: string) => void;
  name?: string;
}) {
  const { t } = useT();
  return (
    <div role="radiogroup" aria-label={t('Colour')} className="flex flex-wrap gap-2.5">
      {swatches.map((s) => (
        <label key={s.name} className="relative cursor-pointer" title={t(s.name)}>
          <input
            type="radio"
            name={name}
            value={s.name}
            checked={value === s.name}
            onChange={() => onChange(s.name)}
            className="peer sr-only"
            aria-label={s.soldOut ? t('{color}, sold out', { color: t(s.name) }) : t(s.name)}
          />
          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-full border-2 border-transparent p-[3px] transition-colors',
              'peer-checked:border-fg hover:border-border-strong',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)]',
            )}
          >
            <span
              className={cn(
                'relative size-full overflow-hidden rounded-full border border-black/15',
                s.soldOut && 'opacity-50',
              )}
              style={{ backgroundColor: s.hex }}
            >
              {s.soldOut && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-black/40"
                />
              )}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

/** Tiny non-interactive dots, used inside product cards. */
export function ColorDots({
  swatches,
  value,
  onSelect,
  max = 5,
}: {
  swatches: Swatch[];
  value: string;
  onSelect: (name: string) => void;
  max?: number;
}) {
  const shown = swatches.slice(0, max);
  const extra = swatches.length - shown.length;
  const { t } = useT();
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('Colours')}>
      {shown.map((s) => (
        <button
          key={s.name}
          type="button"
          aria-label={t(s.name)}
          aria-pressed={value === s.name}
          title={t(s.name)}
          onClick={() => onSelect(s.name)}
          className="inline-flex size-6 items-center justify-center rounded-full"
        >
          <span
            className={cn(
              'size-3.5 rounded-full border border-black/20 transition-shadow',
              value === s.name && 'ring-1 ring-fg ring-offset-2 ring-offset-bg',
            )}
            style={{ backgroundColor: s.hex }}
          />
        </button>
      ))}
      {extra > 0 && <span className="text-[0.6875rem] text-muted">+{extra}</span>}
    </div>
  );
}
