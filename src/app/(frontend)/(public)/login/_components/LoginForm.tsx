'use client';

import { useRouter } from 'next/navigation';
import React, { FormEvent, ReactElement, useState } from 'react';
import { login } from '../_actions/login';
import { LoginResponse, LOGIN_ERROR_CODES } from '../_actions/loginTypes';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useT } from '@/app/i18n/client';

export default function LoginForm(): ReactElement {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { t } = useT();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('About to call login action with:', { email });

    try {
      const result: LoginResponse = await login({ email, password });
      console.log('Raw result:', result);

      if (result?.success) {
        console.log('Success - redirecting to dashboard');
        router.push(`/dashboard`);
      } else {
        console.log('Failed - showing error:', result?.error);
        // Map error codes to translated messages
        let translatedError = t('auth.login.errors.loginFailed');

        if (result?.errorCode) {
          switch (result.errorCode) {
            case LOGIN_ERROR_CODES.INVALID_CREDENTIALS:
              translatedError = t('auth.login.errors.invalidCredentials');
              break;
            case LOGIN_ERROR_CODES.USER_NOT_FOUND:
              translatedError = t('auth.login.errors.userNotFound');
              break;
            case LOGIN_ERROR_CODES.NETWORK_ERROR:
              translatedError = t('auth.login.errors.networkError');
              break;
            case LOGIN_ERROR_CODES.SERVER_ERROR:
            case LOGIN_ERROR_CODES.VALIDATION_ERROR:
            case LOGIN_ERROR_CODES.ACCOUNT_DISABLED:
            default:
              translatedError = t('auth.login.errors.unexpectedError');
              break;
          }
        }

        setError(translatedError);
      }
    } catch (error) {
      console.error('Login error:', error);
      // For client-side errors (network issues, etc.)
      setError(t('auth.login.errors.networkError'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 lg:px-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl">{t('auth.login.title')}</CardTitle>
          <CardDescription className="text-center">{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input id="email" name="email" type="email" placeholder={t('auth.login.email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input id="password" name="password" type="password" placeholder={t('auth.login.password')} required />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t('auth.login.submitting') : t('auth.login.submitButton')}
            </Button>
          </form>
          <p className="text-muted-foreground mt-6 text-center text-sm">
            {t('auth.login.signupLink.text')}{' '}
            <Link href={`/signup`} className="text-primary font-medium hover:underline">
              {t('auth.login.signupLink.link')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
