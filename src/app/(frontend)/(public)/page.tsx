import { getT } from '../../i18n/server';
import H1 from '../_components/H1';
import Section from '../_components/Section';
import Link from 'next/link';

export default async function HomePage() {
  const { t } = await getT();

  return (
    <Section>
      <H1 className="mb-8 w-full">{t('home.welcome')}</H1>
      <p>
        {t('home.description.text')}{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          {t('navigation.signup')}
        </Link>{' '}
        {t('home.description.or')}{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          {t('navigation.signin')}
        </Link>{' '}
        {t('home.description.getStarted')}.
      </p>
    </Section>
  );
}
