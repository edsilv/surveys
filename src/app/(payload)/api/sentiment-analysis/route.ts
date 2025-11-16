import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { analyzeSentiment } from '@/endpoints/surveyEndpoints';

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise });

  // Create a minimal PayloadRequest object
  const payloadRequest = {
    payload,
    user: null,
    json: async () => request.json(),
  } as any;

  const result = await analyzeSentiment(payload, payloadRequest);

  return Response.json(result.body, { status: result.status });
}
