import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  cacheComponents: true,
  webpack: (config, { webpack }) => {
    // Ignore thread-stream test directory completely
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^tap$|^why-is-node-running$|^pino-elasticsearch$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /thread-stream/,
      }),
    );

    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
