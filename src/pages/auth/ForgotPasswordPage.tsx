import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/primitives';
import { AuthShell } from '@/features/auth/AuthShell';
import { useT } from '@/i18n';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation';
import { api } from '@/services';

export default function ForgotPasswordPage() {
  const { t, tm } = useT();
  const [sent, setSent] = useState<{ email: string; devUrl?: string } | null>(null);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError('');
    try {
      const res = await api.auth.requestPasswordReset(email);
      setSent({ email, devUrl: res.devResetUrl });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  });

  // the email is rendered in bold, so split the sentence around its placeholder
  const [sentBefore = '', sentAfter = ''] = t(
    'If an account exists for {email}, a reset link is on its way.',
  ).split('{email}');

  return (
    <AuthShell
      title={t('Reset password')}
      subtitle={t('Enter your email and we’ll send you a reset link.')}
      footer={
        <Link to="/sign-in" className="font-medium text-fg underline underline-offset-4">
          {t('Back to sign in')}
        </Link>
      }
    >
      <Seo title={t('Forgot password')} noindex />
      {sent ? (
        <div className="space-y-4 text-center" role="status">
          <MailCheck className="mx-auto size-10 text-success" aria-hidden />
          <p className="font-display text-2xl">{t('Check your inbox')}</p>
          <p className="text-sm text-muted">
            {sentBefore}
            <strong className="text-fg">{sent.email}</strong>
            {sentAfter}
          </p>
          {sent.devUrl && (
            <InlineAlert tone="info" className="text-left">
              <p className="font-medium">{t('Demo mode')}</p>
              <p className="mt-1">{t('No email is sent in the demo. Use this link instead:')}</p>
              <Link
                to={sent.devUrl}
                className="mt-2 inline-block font-medium underline underline-offset-4"
              >
                {t('Open reset link')}
              </Link>
            </InlineAlert>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && <InlineAlert tone="error">{tm(formError)}</InlineAlert>}
          <Input
            label={t('Email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" size="lg" block loading={isSubmitting}>
            {t('Send reset link')}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
