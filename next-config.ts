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
        protocol: 'https' as const,
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is required for Electron to work with Next.js's static export.
  output: 'export',
  // This is a workaround to prevent Next.js from trying to resolve
  // server-side modules on the client.
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'async_hooks': false,
            'child_process': false,
            'dgram': false,
            'dns': false,
            'fs': false,
            'net': false,
            'tls': false,
            'http2': false,
            'os': false,
            'path': false,
            'stream': false,
            'zlib': false,
            'crypto': false,
        };
    }
    return config;
  }
};

export default nextConfig;
