/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : '',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: false,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/crm-project',
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      path: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    return config;
  },
  // Define static pages for export
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/dashboard': { page: '/dashboard' },
      '/customers': { page: '/customers' },
      '/orders': { page: '/orders' },
      '/communications': { page: '/communications' },
      '/settings': { page: '/settings' },
    };
  },
};

module.exports = nextConfig;
