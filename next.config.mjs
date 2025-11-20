import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    // Ignore test directories in node_modules
    webpackConfig.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /node_modules/,
      }),
    );

    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
