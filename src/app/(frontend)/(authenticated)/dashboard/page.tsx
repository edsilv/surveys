'use server';
import { getPayload } from 'payload';
import React, { Suspense } from 'react';
import configPromise from '@payload-config';
import { Survey } from '@/payload-types';
import Link from 'next/link';
import { getUser } from '../_actions/getUser';
import { getT } from '@/app/i18n/server';
import Section from '../../_components/Section';
import { Spinner } from '@/components/ui/spinner';

const page = async () => {
  const payload = await getPayload({ config: configPromise });
  const { t } = await getT();

  // get the user
  const user = await getUser();

  // get surveys
  let surveys: Survey[] = [];

  try {
    const surveysRes = await payload.find({
      collection: 'surveys',
      limit: 10,
      overrideAccess: false,
      user: user,
    });
    surveys = surveysRes.docs;
  } catch (e) {
    console.log(e);
  }

  return (
    <Section>
      <div className="mb-4 text-xl">
        {t('dashboard.welcome')} <span className="text-gray-400">{user?.email}</span>
      </div>

      <div className="mt-8 w-full">
        <h2 className="mb-8 text-lg">{t('dashboard.surveys.invitedTo')}</h2>
        <Suspense fallback={<Spinner />}>
          {surveys.map((survey) => {
            return (
              <Link
                href={`/dashboard/survey/${survey.id}`}
                key={survey.id}
                className="relative flex cursor-pointer flex-col overflow-hidden bg-gray-100 transition duration-100 ease-in-out hover:border-white"
              >
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-1 text-lg">{survey.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-500">{survey.description}</p>
                  <p className="text-xs text-gray-500">
                    {t('dashboard.surveys.created')} {new Date(survey.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </Suspense>
      </div>
    </Section>
  );
};

export default page;
