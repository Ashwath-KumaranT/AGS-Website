import { cn } from '@/lib/cn';
import type { ProductFacets } from '@/types';
import { Checkbox } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n';
import { PRICE_PRESETS, clearFilters, toggleIn, type FilterState } from './filters';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-border py-5">
      <legend className="eyebrow float-left mb-3 w-full text-fg">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({
  facets,
  value,
  onChange,
  idPrefix = 'f',
}: {
  facets: ProductFacets | undefined;
  value: FilterState;
  onChange: (next: FilterState) => void;
  idPrefix?: string;
}) {
  const { t } = useT();
  if (!facets) return null;
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch, page: 1 });
  const activePreset = PRICE_PRESETS.findIndex((p) => p.min === value.min && p.max === value.max);

  return (
    <div>
      <Section title={t('Availability')}>
        <Checkbox
          label={t('In stock only')}
          checked={value.inStock}
          onChange={(e) => set({ inStock: e.target.checked })}
        />
        <Checkbox
          label={t('On sale')}
          checked={value.onSale}
          onChange={(e) => set({ onSale: e.target.checked })}
        />
      </Section>

      <Section title={t('Price')}>
        <div className="space-y-0.5">
          {PRICE_PRESETS.map((p, i) => (
            <label
              key={p.label}
              className="flex min-h-10 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="radio"
                name={`${idPrefix}-price`}
                checked={activePreset === i}
                onChange={() => set({ min: p.min, max: p.max })}
                className="size-[1.125rem] accent-[var(--accent)]"
              />
              {t(p.label)}
            </label>
          ))}
        </div>
      </Section>

      <Section title={t('Size')}>
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => {
            const on = value.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => set({ sizes: toggleIn(value.sizes, s) })}
                className={cn(
                  'inline-flex h-10 min-w-11 items-center justify-center rounded-[3px] border px-2.5 text-[0.8125rem] font-medium transition-colors',
                  on ? 'border-fg bg-fg text-bg' : 'border-border-strong hover:border-fg',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('Colour')}>
        <div className="flex flex-wrap gap-2.5">
          {facets.colors.map((c) => {
            const on = value.colors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={on}
                aria-label={t(c.name)}
                title={t(c.name)}
                onClick={() => set({ colors: toggleIn(value.colors, c.name) })}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full border-2 p-[3px] transition-colors',
                  on ? 'border-fg' : 'border-transparent hover:border-border-strong',
                )}
              >
                <span
                  className="size-full rounded-full border border-black/15"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('Brand')}>
        {facets.brands.map((b) => (
          <Checkbox
            key={b}
            label={b}
            checked={value.brands.includes(b)}
            onChange={() => set({ brands: toggleIn(value.brands, b) })}
          />
        ))}
      </Section>

      <Button variant="link" className="mt-5 text-sm" onClick={() => onChange(clearFilters(value))}>
        {t('Clear all filters')}
      </Button>
    </div>
  );
}
