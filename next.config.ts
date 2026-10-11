import type { NextConfig } from 'next';

// Where the proxy forwards /api/* (server-side only). Falls back to the
// existing NEXT_PUBLIC_API_URL so current env settings keep working. It must
// be the backend's absolute URL including /api/v1.
function backendUrl(): string {
  const candidates = [
    process.env.BACKEND_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];
  const url = candidates.find((v) => v && /^https?:\/\//.test(v));
  return (url ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '');
}

const nextConfig: NextConfig = {
  // The browser only ever talks to this origin (/api/*), so the auth cookies
  // set by the backend are first-party cookies of the frontend domain.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl()}/:path*`,
      },
    ];
  },
};

export default nextConfig;
