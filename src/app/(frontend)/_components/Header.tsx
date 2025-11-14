import Link from 'next/dist/client/link';
import { getUser } from '../(authenticated)/_actions/getUser';
import { getT } from '@/app/i18n/server';

export async function Header() {
  const user = await getUser();
  const { t } = await getT();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="layout-container flex items-center justify-between px-4 py-4">
        <Link href={`/`} className="text-xl font-semibold hover:text-gray-400">
          {t('header.name')}
        </Link>

        <nav className="hidden items-center space-x-8 md:flex"></nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Link href={`/dashboard`} className="text-foreground hover:text-primary underline transition-colors">
              {t('header.dashboard')}
            </Link>
          ) : (
            <Link href={`/login`} className="text-foreground hover:text-primary underline transition-colors">
              {t('header.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
