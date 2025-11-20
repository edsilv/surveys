import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { cacheLife, cacheTag } from 'next/cache';

export async function getSentimentData() {
  'use cache';
  cacheLife('hours');
  cacheTag('sentiment-analysis');

  console.log('[CACHE] getSentimentData called - fetching from database');
  const startTime = Date.now();

  const payload = await getPayload({ config: configPromise });

  const results = await payload.find({
    collection: 'response-items',
    where: {
      questionType: { equals: 'textarea' },
      sentiment: { exists: true },
    },
    depth: 2,
    limit: 1000,
  });

  const duration = Date.now() - startTime;
  console.log(`[CACHE] getSentimentData completed in ${duration}ms - returned ${results.docs.length} items`);

  return results.docs;
}

export async function getSurveyList() {
  'use cache';
  cacheLife('hours');
  cacheTag('surveys');

  console.log('[CACHE] getSurveyList called - fetching from database');
  const startTime = Date.now();

  const payload = await getPayload({ config: configPromise });

  const surveys = await payload.find({
    collection: 'surveys',
    limit: 100,
    sort: 'title',
  });

  const duration = Date.now() - startTime;
  console.log(`[CACHE] getSurveyList completed in ${duration}ms - returned ${surveys.docs.length} items`);

  return surveys.docs.map((survey) => ({
    id: typeof survey.id === 'number' ? survey.id : parseInt(survey.id as string),
    title: survey.title,
  }));
}
