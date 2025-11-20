import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  webpack: (config, { isServer }) => {
    // Completely ignore thread-stream test files
    config.plugins.push(
      new (require('webpack').NormalModuleReplacementPlugin)(
        /thread-stream\/test\//,
        require.resolve('./src/lib/empty-module.js'),
      ),
    );

    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
