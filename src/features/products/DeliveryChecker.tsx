import { useMutation } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n';
import { formatDateRange, formatMoney } from '@/lib/format';
import { getDeliveryOption } from '@/lib/pricing';
import { api } from '@/services';

export function DeliveryChecker() {
  const { t, tm } = useT();
  const [code, setCode] = useState('');
  const check = useMutation({ mutationFn: (c: string) => api.checkout.checkDelivery(c) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) check.mutate(code.trim());
  };

  return (
    <div className="rounded-[4px] border border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium">
        <MapPin className="size-4" aria-hidden /> {t('Check delivery')}
      </p>
      <form onSubmit={submit} className="flex gap-2" noValidate>
        <label htmlFor="pincode" className="sr-only">
          {t('Postal code')}
        </label>
        <input
          id="pincode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('Enter postal code')}
          autoComplete="postal-code"
          className="h-11 min-w-0 flex-1 rounded-[3px] border border-border-strong bg-surface px-3.5 text-sm focus:border-fg focus:outline-none"
        />
        <Button type="submit" variant="outline" loading={check.isPending}>
          {t('Check')}
        </Button>
      </form>
      <div aria-live="polite" className="mt-3 text-sm">
        {check.isError && (
          <p className="text-sale">{t('Couldn’t check right now. Please try again.')}</p>
        )}
        {check.data && !check.data.serviceable && (
          <p className="text-sale">{tm(check.data.message)}</p>
        )}
        {check.data?.serviceable && (
          <ul className="space-y-1.5">
            {check.data.options.map((o) => {
              const opt = getDeliveryOption(o.id);
              return (
                <li key={o.id} className="flex justify-between gap-3">
                  <span className="text-muted">{t(opt.label)}</span>
                  <span className="text-right">
                    {formatDateRange(o.from, o.to)} ·{' '}
                    {opt.price === 0 ? t('Free') : formatMoney(opt.price)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
