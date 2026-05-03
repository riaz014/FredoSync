/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fredo-cloud/types'],
  images: {
    domains: ['api.dicebear.com', 'res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.alias['@fredo-cloud/types'] = path.resolve(__dirname, '../../packages/types/index.ts');
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
