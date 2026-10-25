import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Field';
import { useT } from '@/i18n';
import { COUNTRIES, addressSchema, type AddressValues } from '@/lib/validation';

export const EMPTY_ADDRESS: AddressValues = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
  is_default: false,
};

export function AddressForm({
  defaultValues = EMPTY_ADDRESS,
  onSubmit,
  submitLabel,
  loading,
  showDefault = true,
  onCancel,
  formId,
  hideSubmit,
}: {
  defaultValues?: AddressValues;
  onSubmit: (values: AddressValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  showDefault?: boolean;
  onCancel?: () => void;
  formId?: string;
  hideSubmit?: boolean;
}) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues });

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2"
      noValidate
      aria-label={t('Address form')}
    >
      <Input
        label={t('Full name')}
        autoComplete="name"
        error={errors.name?.message}
        wrapperClassName="sm:col-span-1"
        {...register('name')}
      />
      <Input
        label={t('Phone')}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label={t('Address line 1')}
        autoComplete="address-line1"
        error={errors.line1?.message}
        wrapperClassName="sm:col-span-2"
        {...register('line1')}
      />
      <Input
        label={t('Apartment, suite, etc. (optional)')}
        autoComplete="address-line2"
        error={errors.line2?.message}
        wrapperClassName="sm:col-span-2"
        {...register('line2')}
      />
      <Select
        label={t('Country')}
        autoComplete="country"
        error={errors.country?.message}
        {...register('country')}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {t(c.name)}
          </option>
        ))}
      </Select>
      <Input
        label={t('State / region')}
        autoComplete="address-level1"
        error={errors.state?.message}
        {...register('state')}
      />
      <Input
        label={t('City')}
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register('city')}
      />
      <Input
        label={t('Postal code')}
        autoComplete="postal-code"
        error={errors.postal_code?.message}
        {...register('postal_code')}
      />
      {showDefault && (
        <div className="sm:col-span-2">
          <Checkbox label={t('Set as my default address')} {...register('is_default')} />
        </div>
      )}
      {!hideSubmit && (
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" loading={loading}>
            {submitLabel ?? t('Save address')}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
