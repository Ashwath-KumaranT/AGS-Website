import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Field';
import { ErrorState, InlineAlert, Skeleton } from '@/components/ui/primitives';
import { AddressCard } from '@/features/account/AddressCard';
import { AddressForm, EMPTY_ADDRESS } from '@/features/account/AddressForm';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { addressSchema, emailSchema, type AddressValues } from '@/lib/validation';
import { api } from '@/services';
import type { AddressInput } from '@/types';

export interface AddressStepResult {
  email: string;
  address: AddressInput;
}

export function AddressStep({
  initialEmail,
  initial,
  onDone,
}: {
  initialEmail: string;
  initial: AddressInput | null;
  onDone: (r: AddressStepResult) => void;
}) {
  const qc = useQueryClient();
  const { t, tm } = useT();
  const {
    data: saved,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: qk.addresses, queryFn: () => api.account.listAddresses() });
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState('');
  const [choice, setSelected] = useState<string | 'new' | null>(null);
  const [saveNew, setSaveNew] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // preselect: previously chosen → the address already entered → default → first → new.
  // An `initial` that matches nothing saved is an unsaved address the shopper typed here;
  // coming back to this step must not quietly swap it for their default one.
  const match =
    initial &&
    saved?.find((a) => a.line1 === initial.line1 && a.postal_code === initial.postal_code);
  const fallback = initial
    ? (match?.id ?? 'new')
    : (saved?.find((a) => a.is_default)?.id ?? saved?.[0]?.id ?? 'new');
  const selected = choice ?? (saved ? fallback : null);

  const validateEmail = (): string | null => {
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      setEmailError(r.error.issues[0]?.message ?? 'Enter a valid email');
      return null;
    }
    setEmailError('');
    return r.data;
  };

  const continueWithSaved = () => {
    const mail = validateEmail();
    const addr = saved?.find((a) => a.id === selected);
    if (!mail || !addr) return;
    const parsed = addressSchema.safeParse(addr);
    if (!parsed.success) {
      setError('This saved address is incomplete. Edit it in your account or choose another.');
      return;
    }
    setError('');
    onDone({
      email: mail,
      address: {
        name: addr.name,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
      },
    });
  };

  const continueWithNew = async (values: AddressValues) => {
    const mail = validateEmail();
    if (!mail) return;
    setSaving(true);
    try {
      const { is_default, ...addr } = values;
      if (saveNew) {
        await api.account.saveAddress({ ...addr, is_default: Boolean(is_default) });
        await qc.invalidateQueries({ queryKey: qk.addresses });
      }
      onDone({ email: mail, address: addr });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="contact-h">
        <h2 id="contact-h" className="mb-4 text-2xl">
          {t('Contact')}
        </h2>
        <Input
          label={t('Email for order updates')}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={validateEmail}
          error={emailError}
        />
      </section>

      <section aria-labelledby="ship-h">
        <h2 id="ship-h" className="mb-4 text-2xl">
          {t('Shipping address')}
        </h2>
        {error && (
          <InlineAlert tone="error" className="mb-4">
            {tm(error)}
          </InlineAlert>
        )}

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState
            title={t('Couldn’t load your addresses')}
            onRetry={() => void refetch()}
            className="py-6"
          />
        ) : (
          <div className="space-y-3" role="radiogroup" aria-label={t('Shipping address')}>
            {saved?.map((a) => (
              <label key={a.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="address"
                  className="peer sr-only"
                  checked={selected === a.id}
                  onChange={() => setSelected(a.id)}
                  aria-label={t('Ship to {name}, {line1}', { name: a.name, line1: a.line1 })}
                />
                <AddressCard
                  address={a}
                  selected={selected === a.id}
                  className={cn(
                    'transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--ring)]',
                    selected === a.id && 'ring-1 ring-fg',
                  )}
                />
              </label>
            ))}
            <label className="block cursor-pointer">
              <input
                type="radio"
                name="address"
                className="peer sr-only"
                checked={selected === 'new'}
                onChange={() => setSelected('new')}
              />
              <span
                className={cn(
                  'flex min-h-14 items-center rounded-[6px] border px-4 text-sm font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--ring)]',
                  selected === 'new' ? 'border-fg ring-1 ring-fg' : 'border-border',
                )}
              >
                + {t('Use a new address')}
              </span>
            </label>
          </div>
        )}

        {selected === 'new' && (
          <div className="mt-6">
            <AddressForm
              defaultValues={
                initial
                  ? { ...EMPTY_ADDRESS, ...initial, line2: initial.line2 ?? '' }
                  : EMPTY_ADDRESS
              }
              onSubmit={continueWithNew}
              submitLabel={t('Continue to delivery')}
              loading={saving}
              showDefault={false}
              formId="checkout-address"
            />
            <div className="mt-2">
              <Checkbox
                label={t('Save this address to my account')}
                checked={saveNew}
                onChange={(e) => setSaveNew(e.target.checked)}
              />
            </div>
          </div>
        )}
      </section>

      {selected && selected !== 'new' && (
        <Button size="lg" block onClick={continueWithSaved}>
          {t('Continue to delivery')}
        </Button>
      )}
    </div>
  );
}
