/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.us-west-004.backblazeb2.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle JSON imports with type assertions
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle Base wallet package
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Handle JSON modules
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: [
    '@base-org/account',
    '@reown/appkit',
    '@reown/appkit-adapter-wagmi',
    'viem',
    'wagmi'
  ],
}

module.exports = nextConfig
