import { Header } from '../_components/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}
