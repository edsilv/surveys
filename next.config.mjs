import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  serverExternalPackages: ['pino', 'thread-stream'],
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
