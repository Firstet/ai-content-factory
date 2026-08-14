/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@acf/shared'],
  async rewrites() {
    // In Docker, 'api' container hostname is accessible internally at http://api:3001/api
    const apiTarget = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api';
    const cleanTarget = apiTarget.replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${cleanTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
