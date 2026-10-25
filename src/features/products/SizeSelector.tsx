import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { ProductVariant } from '@/types';

interface SizeSelectorProps {
  /** variants of the currently selected colour, one per size */
  variants: ProductVariant[];
  value: string | null;
  onChange: (size: string) => void;
  name?: string;
  error?: boolean;
  size?: 'sm' | 'md';
}

/** Radio-group size picker. Native radios give correct keyboard + screen-reader behaviour. */
export function SizeSelector({
  variants,
  value,
  onChange,
  name = 'size',
  error,
  size = 'md',
}: SizeSelectorProps) {
  const { t } = useT();
  return (
    <div role="radiogroup" aria-label={t('Size')} className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const soldOut = v.inventory_count <= 0;
        const low = !soldOut && v.inventory_count <= 3;
        return (
          <label key={v.id} className={cn('relative', soldOut && 'cursor-not-allowed')}>
            <input
              type="radio"
              name={name}
              value={v.size}
              checked={value === v.size}
              disabled={soldOut}
              onChange={() => onChange(v.size)}
              className="peer sr-only"
              aria-label={
                soldOut
                  ? t('Size {size}, sold out', { size: v.size })
                  : low
                    ? t('Size {size}, only {count} left', {
                        size: v.size,
                        count: v.inventory_count,
                      })
                    : t('Size {size}', { size: v.size })
              }
            />
            <span
              className={cn(
                'relative flex items-center justify-center rounded-[3px] border text-sm font-medium transition-colors',
                size === 'md' ? 'h-11 min-w-12 px-3' : 'h-9 min-w-10 px-2.5 text-[0.8125rem]',
                'border-border-strong bg-surface hover:border-fg',
                'peer-checked:border-fg peer-checked:bg-fg peer-checked:text-bg',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)]',
                soldOut && 'overflow-hidden border-dashed text-muted/60 hover:border-border-strong',
                error && !soldOut && value === null && 'border-sale',
              )}
            >
              {v.size}
              {soldOut && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-px -rotate-[25deg] bg-border-strong"
                />
              )}
              {low && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg"
                />
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
