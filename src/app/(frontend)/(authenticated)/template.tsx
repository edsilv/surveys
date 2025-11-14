import { redirect } from 'next/navigation';
import React, { FC, ReactNode } from 'react';
import { getUser } from './_actions/getUser';
import Header from './_components/Header';

interface LayoutProps {
  children: ReactNode;
}

const Template: FC<LayoutProps> = async ({ children }) => {
  const user = await getUser();
  if (!user) {
    redirect('/login');
    return null;
  }
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default Template;
