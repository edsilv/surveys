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
import { CheckCircle2 } from 'lucide-react';

const page = async () => {
  const payload = await getPayload({ config: configPromise });
  const { t } = await getT();

  // get the user
  const user = await getUser();

  // get surveys
  let surveys: Survey[] = [];
  const completedSurveyIds = new Set<number>();

  try {
    const surveysRes = await payload.find({
      collection: 'surveys',
      limit: 10,
      overrideAccess: false,
      user: user,
    });
    surveys = surveysRes.docs;

    // Get completed survey responses for this respondent
    if (user?.id) {
      const completedResponses = await payload.find({
        collection: 'survey-responses',
        where: {
          and: [{ respondent: { equals: user.id } }, { completed: { equals: true } }],
        },
      });

      // Store completed survey IDs in a Set for fast lookup
      completedResponses.docs.forEach((response) => {
        if (typeof response.survey === 'number') {
          completedSurveyIds.add(response.survey);
        } else if (response.survey && typeof response.survey === 'object' && 'id' in response.survey) {
          completedSurveyIds.add(response.survey.id as number);
        }
      });
    }
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
          {surveys.length === 0 ? (
            <p className="text-gray-500">{t('dashboard.surveys.noSurveys')}</p>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => {
                const isCompleted = completedSurveyIds.has(survey.id as number);
                return (
                  <Link
                    href={`/dashboard/survey/${survey.id}`}
                    key={survey.id}
                    className="relative flex cursor-pointer flex-col overflow-hidden bg-gray-100 transition duration-200 ease-in-out hover:bg-gray-200 hover:shadow-md"
                  >
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="line-clamp-1 text-lg">{survey.title}</h3>
                        {isCompleted && <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600" />}
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-500">{survey.description}</p>
                      <p className="text-xs text-gray-500">
                        {t('dashboard.surveys.created')} {new Date(survey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Suspense>
      </div>
    </Section>
  );
};

export default page;
