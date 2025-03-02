import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.yandex.net',
        port: '', // Оставьте пустым, если не используете нестандартный порт
        pathname: '/**', // Разрешает все пути на этом домене
      },
    ],
  },
};

export default nextConfig;
