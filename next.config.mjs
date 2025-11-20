import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  webpack: (config, { isServer }) => {
    const webpack = require('webpack');

    // Replace thread-stream test files with empty module
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream[/\\]test[/\\]/,
        require.resolve('./src/lib/empty-module.js'),
      ),
    );

    // Provide empty implementations for test dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      tap: false,
      'why-is-node-running': false,
      'pino-elasticsearch': false,
    };

    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
