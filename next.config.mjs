import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    // Exclude test files from node_modules
    webpackConfig.module.rules.push({
      test: /node_modules.*\/test\//,
      use: 'null-loader',
    });

    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
