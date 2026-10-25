import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/primitives';
import { translate, useT } from '@/i18n';
import { loginSchema, signUpSchema, type LoginValues, type SignUpValues } from '@/lib/validation';
import { api } from '@/services';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from '@/services/mock/db';
import { toast } from '@/store/uiStore';
import type { Session } from '@/types';
import { useAuthStore } from './authStore';

export function SignInForm({ onSuccess }: { onSuccess: (s: Session) => void }) {
  const { t, tm } = useT();
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      const session = await api.auth.signIn(values);
      setSession(session);
      toast.success(
        translate('Welcome back, {name}', { name: session.user.name.split(' ')[0] ?? '' }),
      );
      onSuccess(session);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not sign in. Please try again.');
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4" noValidate aria-label={t('Sign in')}>
        {formError && <InlineAlert tone="error">{tm(formError)}</InlineAlert>}
        <Input
          label={t('Email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('Password')}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm underline underline-offset-4 hover:text-accent"
          >
            {t('Forgot password?')}
          </Link>
        </div>
        <Button type="submit" size="lg" block loading={isSubmitting}>
          {t('Sign in')}
        </Button>
      </form>
      {api.source === 'mock' && (
        <div className="mt-6 rounded-[4px] border border-dashed border-border-strong p-4 text-sm">
          <p className="font-medium">{t('Demo account')}</p>
          <p className="mt-1 text-muted">
            {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setValue('email', DEMO_USER_EMAIL);
              setValue('password', DEMO_USER_PASSWORD);
            }}
          >
            {t('Fill demo credentials')}
          </Button>
        </div>
      )}
    </>
  );
}

export function SignUpForm({ onSuccess }: { onSuccess: (s: Session) => void }) {
  const { t, tm } = useT();
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError('');
    try {
      const session = await api.auth.signUp({ name, email, password });
      setSession(session);
      toast.success(
        translate('Account created'),
        translate('Use WELCOME10 for 10% off your first order.'),
      );
      onSuccess(session);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : 'Could not create your account. Please try again.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-label={t('Create account')}>
      {formError && <InlineAlert tone="error">{tm(formError)}</InlineAlert>}
      <Input
        label={t('Full name')}
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label={t('Email')}
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t('Password')}
        type="password"
        autoComplete="new-password"
        hint={t('At least 8 characters, with a letter and a number.')}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label={t('Confirm password')}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" size="lg" block loading={isSubmitting}>
        {t('Create account')}
      </Button>
      <p className="text-center text-xs text-muted">
        {t('By creating an account you agree to our')}{' '}
        <Link to="/terms" className="underline underline-offset-2">
          {t('Terms')}
        </Link>{' '}
        {t('and')}{' '}
        <Link to="/privacy" className="underline underline-offset-2">
          {t('Privacy Policy')}
        </Link>
        .
      </p>
    </form>
  );
}
