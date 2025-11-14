'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/app/i18n/client';
import { logout } from '../_actions/logout';

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useT();

  async function handleLogout() {
    setIsPending(true);
    setError(null);

    const result = await logout();

    setIsPending(false);

    if (result.success) {
      // Redirect to home page after successful logout
      router.push('/');
    } else {
      // Display error message
      setError(result.error || t('auth.logout.failed'));
    }
  }

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleLogout} disabled={isPending} className="underline">
        {isPending ? t('auth.logout.submitting') : t('auth.logout.button')}
      </button>
    </>
  );
}
