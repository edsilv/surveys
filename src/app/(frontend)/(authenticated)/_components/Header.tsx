'use client';

import Link from 'next/link';
import { useT } from '@/app/i18n/client';
import LogoutButton from './LogoutButton';

const Header: React.FC = () => {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="layout-container flex items-center justify-between px-4 py-4">
        <div>
          <Link href={`/`} className="text-xl font-semibold hover:text-gray-400">
            {t('header.name')}
          </Link>
          <span className="px-2 font-semibold">/</span>
          <Link href="/dashboard" className="text-xl font-semibold hover:text-gray-400">
            {t('navigation.dashboard')}
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
