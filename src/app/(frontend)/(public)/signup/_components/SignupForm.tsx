'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent, ReactElement } from 'react';
import Link from 'next/link';
import { signup } from '../_actions/signup';
import { SignupResponse, SIGNUP_ERROR_CODES } from '../_actions/signupTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useT } from '@/app/i18n/client';

export default function SignupForm(): ReactElement {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useT();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsPending(true);
    setError(null); // Reset error state

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError(t('auth.signup.errors.passwordMismatch'));
      setIsPending(false);
      return;
    }

    try {
      const result: SignupResponse = await signup({ email, password });

      if (result.success) {
        console.log('Success - redirecting to dashboard');
        router.push(`/dashboard`);
      } else {
        console.log('Failed - showing error:', result.error);
        // Map error codes to translated messages
        let translatedError = t('auth.signup.errors.signupFailed');

        if (result.errorCode) {
          switch (result.errorCode) {
            case SIGNUP_ERROR_CODES.EMAIL_EXISTS:
              translatedError = t('auth.signup.errors.emailExists');
              break;
            case SIGNUP_ERROR_CODES.VALIDATION_ERROR:
              translatedError = t('auth.signup.errors.validationError');
              break;
            case SIGNUP_ERROR_CODES.NETWORK_ERROR:
              translatedError = t('auth.signup.errors.networkError');
              break;
            case SIGNUP_ERROR_CODES.SERVER_ERROR:
            case SIGNUP_ERROR_CODES.SIGNUP_FAILED:
            default:
              translatedError = t('auth.signup.errors.unexpectedError');
              break;
          }
        }

        setError(translatedError);
      }
    } catch (error) {
      console.error('Signup error:', error);
      // For client-side errors (network issues, etc.)
      setError(t('auth.signup.errors.networkError'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 lg:px-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl">{t('auth.signup.title')}</CardTitle>
          <CardDescription className="text-center">{t('auth.signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.signup.email')}</Label>
              <Input id="email" name="email" type="email" placeholder={t('auth.signup.email')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.signup.password')}</Label>
              <Input id="password" name="password" type="password" placeholder={t('auth.signup.password')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('auth.signup.confirmPassword')}
                required
              />
            </div>

            {error && <div className="text-destructive text-sm">{error}</div>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t('auth.signup.errors.submitting') : t('auth.signup.submitButton')}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            {t('auth.signup.loginLink')}{' '}
            <Link href={`/login`} className="text-primary font-medium hover:underline">
              {t('auth.login.title')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
