import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.vchugaev.ru',
        port: '',
        pathname: '/smartmatch/**',
      },
    ],
  },
};

export default nextConfig;
