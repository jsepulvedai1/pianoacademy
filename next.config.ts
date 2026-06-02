import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    return [
      {
        source: '/graphql/',
        destination: `${backendUrl}/graphql/`,
      },
      {
        source: '/graphql',
        destination: `${backendUrl}/graphql/`,
      },
      {
        source: '/media/:path*',
        destination: `${backendUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
