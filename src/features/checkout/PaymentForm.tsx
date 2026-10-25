import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Lock } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { formatMoney } from '@/lib/format';
import {
  cardBrand,
  formatCardNumber,
  formatExpiry,
  paymentSchema,
  type PaymentValues,
} from '@/lib/validation';
import { api } from '@/services';

export function PaymentForm({
  total,
  loading,
  error,
  onSubmit,
  mode,
}: {
  total: number;
  loading: boolean;
  error?: string | null;
  onSubmit: (values: PaymentValues | null) => void;
  mode: 'inline-card' | 'hosted-redirect';
}) {
  const { t, tm } = useT();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { number: '', name: '', expiry: '', cvc: '' },
  });
  const brand = cardBrand(useWatch({ control, name: 'number' }) ?? '');

  if (mode === 'hosted-redirect') {
    return (
      <div className="space-y-4">
        {error && <InlineAlert tone="error">{tm(error)}</InlineAlert>}
        <InlineAlert>
          <p className="flex items-center gap-2 font-medium">
            <Lock className="size-4" aria-hidden /> {t('Secure payment')}
          </p>
          <p className="mt-1 text-muted">
            {t('You’ll be redirected to our payment partner to enter your card details safely.')}
          </p>
        </InlineAlert>
        <Button size="lg" block loading={loading} onClick={() => onSubmit(null)}>
          {t('Continue to payment · {amount}', { amount: formatMoney(total) })}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="space-y-4"
      noValidate
      aria-label={t('Payment details')}
    >
      {error && <InlineAlert tone="error">{tm(error)}</InlineAlert>}

      <div className="relative">
        <Input
          label={t('Card number')}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          maxLength={23}
          error={errors.number?.message}
          {...register('number', {
            setValueAs: (v: string) => formatCardNumber(v),
            onChange: (e) => (e.target.value = formatCardNumber(e.target.value)),
          })}
        />
        <span className="pointer-events-none absolute right-3 top-[2.125rem] flex items-center gap-1.5 text-xs text-muted">
          <CreditCard className="size-4" aria-hidden />
          {brand !== 'Card' && brand}
        </span>
      </div>
      <Input
        label={t('Name on card')}
        autoComplete="cc-name"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('Expiry (MM/YY)')}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          maxLength={5}
          error={errors.expiry?.message}
          {...register('expiry', {
            setValueAs: (v: string) => formatExpiry(v),
            onChange: (e) => (e.target.value = formatExpiry(e.target.value)),
          })}
        />
        <Input
          label={t('Security code')}
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="CVC"
          maxLength={4}
          error={errors.cvc?.message}
          {...register('cvc')}
        />
      </div>

      {api.source === 'mock' && (
        <details className="rounded-[4px] border border-dashed border-border-strong p-3 text-[0.8125rem]">
          <summary className="cursor-pointer font-medium">{t('Test cards (demo mode)')}</summary>
          <ul className="mt-2 space-y-1 text-muted">
            <li>
              <code className="text-fg">4242 4242 4242 4242</code> — {t('succeeds')}
            </li>
            <li>
              <code className="text-fg">4000 0000 0000 0002</code> — {t('declined')}
            </li>
            <li>
              <code className="text-fg">4000 0000 0000 9995</code> — {t('insufficient funds')}
            </li>
            <li>{t('Any future expiry and any 3-digit CVC.')}</li>
          </ul>
        </details>
      )}

      <Button type="submit" size="lg" block loading={loading} data-testid="pay-button">
        <Lock className="size-4" aria-hidden />
        {t('Pay {amount}', { amount: formatMoney(total) })}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Lock className="size-3" aria-hidden />{' '}
        {t(
          'Encrypted payment. Card details go straight to our payment provider and are never stored by ASG.',
        )}
      </p>
    </form>
  );
}
