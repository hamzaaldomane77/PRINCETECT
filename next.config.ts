import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'false',
          },
        ],
      },
    ];
  },
  // Enable experimental features for better CORS handling
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
