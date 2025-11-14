import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Members } from './collections/Members';
import { Questions } from './collections/Questions';
import { Surveys } from './collections/Surveys';
import { SurveyResponses } from './collections/SurveyResponses';
import { ResponseItems } from './collections/ResponseItems';
import { isDevelopment } from './utilities/isDevelopment';
import { getSurvey, completeSurvey } from './endpoints/surveyEndpoints';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Helper function to get the correct database URL based on environment
 * Provides fallbacks to ensure reliable database connection
 */
const getDatabaseUrl = (): string => {
  if (isDevelopment()) {
    const devUrl = process.env.POSTGRES_DEV_DATABASE_URL;
    if (!devUrl) {
      throw new Error('POSTGRES_DEV_DATABASE_URL is required in development');
    }
    return devUrl;
  }

  // In production/preview, prefer the production URL with fallback
  const prodUrl = process.env.POSTGRES_DATABASE_URL;
  if (!prodUrl) {
    throw new Error('POSTGRES_DATABASE_URL is required in production');
  }
  return prodUrl;
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Members, Questions, Surveys, SurveyResponses, ResponseItems],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: getDatabaseUrl(),
    },
    // Only allow database schema changes in development
    push: isDevelopment(),
  }),
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  endpoints: [
    {
      path: '/surveys/:id',
      method: 'get',
      handler: async (req) => {
        const surveyId = req.routeParams?.id as string;
        if (!surveyId) {
          return Response.json({ error: 'Survey ID is required' }, { status: 400 });
        }

        const result = await getSurvey(req.payload, surveyId, req);
        return Response.json(result.body, { status: result.status });
      },
    },
    {
      path: '/survey-complete/:id',
      method: 'post',
      handler: async (req) => {
        const surveyId = req.routeParams?.id as string;
        if (!surveyId) {
          return Response.json({ error: 'Survey ID is required' }, { status: 400 });
        }

        const result = await completeSurvey(req.payload, surveyId, req);
        return Response.json(result.body, { status: result.status });
      },
    },
  ],
});
