import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is required for Electron to work with Next.js's static export.
  output: 'export',
  // This is a workaround to prevent Next.js from trying to generate static params
  // for dynamic routes, which is not possible for our use case.
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'fs/promises': false,
            fs: false,
        };
    }
    config.module.rules.push({
        test: /report\/\[id\]\/page\.tsx$/,
        loader: 'string-replace-loader',
        options: {
            search: 'export const dynamicParams = true;',
            replace: 'export const dynamicParams = false;\nexport const generateStaticParams = () => [];',
            flags: 'g'
        }
    });
    return config;
  }
};

export default nextConfig;
