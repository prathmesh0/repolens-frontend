import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`, // Redirects /api calls to your backend
      },
    ];
  },
};

export default nextConfig;
