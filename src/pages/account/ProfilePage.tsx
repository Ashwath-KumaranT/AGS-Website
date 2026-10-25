import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useAuthStore } from '@/features/auth/authStore';
import { useT } from '@/i18n';
import { formatDate } from '@/lib/format';
import { profileSchema, type ProfileValues } from '@/lib/validation';
import { api } from '@/services';
import { toast } from '@/store/uiStore';

export default function ProfilePage() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const profile = await api.auth.updateProfile(v);
      useAuthStore.setState({ user: profile });
      reset({ name: profile.name, phone: profile.phone });
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Could not update profile', e instanceof Error ? e.message : undefined);
    }
  });

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <Seo title={t('Profile')} noindex />
      <h1 className="text-3xl md:text-4xl">{t('Profile')}</h1>
      <p className="mt-1 text-muted">
        {t('Member since {date}', { date: formatDate(user.created_at) })}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label={t('Full name')}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('Email')}
          type="email"
          value={user.email}
          disabled
          hint="Contact support to change your sign-in email."
          readOnly
        />
        <Input
          label={t('Phone (optional)')}
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          {t('Save changes')}
        </Button>
      </form>
      <div className="mt-10 border-t border-border pt-6">
        <h2 className="text-xl">{t('Password')}</h2>
        <p className="mt-1 text-sm text-muted">
          {t('We’ll email you a secure link to set a new password.')}
        </p>
        <Link
          to="/forgot-password"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          {t('Reset password')}
        </Link>
      </div>
    </div>
  );
}
