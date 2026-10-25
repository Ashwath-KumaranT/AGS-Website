import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/primitives';
import { AuthShell } from '@/features/auth/AuthShell';
import { useT } from '@/i18n';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation';
import { api } from '@/services';
import { toast } from '@/store/uiStore';

export default function ResetPasswordPage() {
  const { t, tm } = useT();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError('');
    try {
      await api.auth.resetPassword({ token, password });
      toast.success('Password updated', 'Sign in with your new password.');
      navigate('/sign-in', { replace: true });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not reset your password.');
    }
  });

  // Supabase puts the recovery session in the URL hash instead of a token param
  const missing = !token && api.source === 'mock';

  return (
    <AuthShell title={t('Choose a new password')}>
      <Seo title={t('Reset password')} noindex />
      {missing ? (
        <InlineAlert tone="error">
          {t('This reset link is invalid or has expired.')}{' '}
          <Link to="/forgot-password" className="font-medium underline underline-offset-4">
            {t('Request a new one')}
          </Link>
        </InlineAlert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && <InlineAlert tone="error">{tm(formError)}</InlineAlert>}
          <Input
            label={t('New password')}
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label={t('Confirm new password')}
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" size="lg" block loading={isSubmitting}>
            {t('Update password')}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
