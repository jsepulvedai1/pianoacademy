import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/admin/reservations',
        destination: '/admin/leads',
        permanent: false,
      },
      {
        source: '/admin/reservations/',
        destination: '/admin/leads/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_DJANGO_URL ||
      (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
        ? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '')
        : '') ||
      'http://localhost:8000'
    ).replace(/\/$/, '');
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
      {
        source: '/api/media/upload/',
        destination: `${backendUrl}/api/media/upload/`,
      },
      {
        source: '/api/media/:path*',
        destination: `${backendUrl}/api/media/:path*`,
      },
      {
        source: '/api/teachers/upload-photo/',
        destination: `${backendUrl}/api/teachers/upload-photo/`,
      },
      {
        source: '/api/teachers/:path*',
        destination: `${backendUrl}/api/teachers/:path*`,
      },
      {
        source: '/api/mercadopago/:path*',
        destination: `${backendUrl}/api/mercadopago/:path*`,
      },
    ];
  },
};

export default nextConfig;
