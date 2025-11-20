import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  serverExternalPackages: ['pino', 'thread-stream'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Stub out test dependencies that thread-stream's test files try to require
      config.resolve.alias = {
        ...config.resolve.alias,
        'why-is-node-running': false,
        tap: false,
        'pino-elasticsearch': false,
      };
    }
    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
