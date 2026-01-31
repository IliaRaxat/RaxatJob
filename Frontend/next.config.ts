import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
