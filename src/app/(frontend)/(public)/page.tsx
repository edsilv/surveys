import { getT } from '../../i18n/server';
import Section from '../_components/Section';

export default async function HomePage() {
  const { t } = await getT();

  return <Section>home page</Section>;
}
