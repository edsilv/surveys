import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { getUser } from '../../../_actions/getUser';
import { Survey } from '@/payload-types';
import { notFound } from 'next/navigation';

type SurveyDetailsPageProps = {
  params: Promise<{
    lng: string;
    surveyid: string;
  }>;
};

const SurveyPage = async ({ params }: SurveyDetailsPageProps) => {
  const p = await params;

  const { surveyid } = p;

  const payload = await getPayload({ config: configPromise });

  const user = await getUser();

  let survey: Survey | null = null;

  try {
    const res = await payload.findByID({
      collection: 'surveys',
      id: surveyid,
      overrideAccess: false,
      user,
    });

    survey = res;
  } catch (err) {
    console.error('Error fetching survey:', err);
    return notFound();
  }

  if (!survey) {
    return notFound();
  }

  return <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4"></div>;
};

export default SurveyPage;
