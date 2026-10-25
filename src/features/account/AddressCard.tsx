import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { COUNTRIES } from '@/lib/validation';
import type { Address } from '@/types';

type AddressLike = Omit<Address, 'id' | 'user_id' | 'is_default'> & { is_default?: boolean };

/** `tr` translates the country name for display (pass `t` from useT). */
export function formatAddressLines(a: AddressLike, tr: (s: string) => string = (s) => s): string[] {
  const name = COUNTRIES.find((c) => c.code === a.country)?.name;
  const country = name ? tr(name) : a.country;
  return [a.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.postal_code}`, country].filter(
    Boolean,
  );
}

export function AddressCard({
  address,
  actions,
  className,
  selected,
}: {
  address: AddressLike;
  actions?: ReactNode;
  className?: string;
  selected?: boolean;
}) {
  const { t } = useT();
  const lines = formatAddressLines(address, t);
  return (
    <div
      className={cn(
        'rounded-[6px] border bg-surface p-4 text-sm',
        selected ? 'border-fg' : 'border-border',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <address className="space-y-0.5 not-italic">
          {lines.map((l, i) => (
            <p key={l + i} className={i === 0 ? 'font-medium' : 'text-muted'}>
              {l}
            </p>
          ))}
          <p className="pt-1 text-muted">{address.phone}</p>
        </address>
        {address.is_default && <Badge tone="outline">{t('Default')}</Badge>}
      </div>
      {actions && (
        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2">
          {actions}
        </div>
      )}
    </div>
  );
}
