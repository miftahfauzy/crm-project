/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
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
  // Handle static export with API routes
  rewrites: async () => {
    return [];
  },
  // Exclude API routes from static export
  exportPathMap: async function () {
    const paths = {
      '/': { page: '/' },
      '/dashboard': { page: '/dashboard' },
      '/customers': { page: '/customers' },
      '/orders': { page: '/orders' },
      '/communications': { page: '/communications' },
      '/tags': { page: '/tags' },
    };

    // Add dynamic paths
    const dynamicPaths = [
      '/customers/[id]',
      '/orders/[id]',
      '/communications/[id]',
      '/tags/[id]',
    ];

    // Add dynamic paths with placeholder IDs
    dynamicPaths.forEach(path => {
      const staticPath = path.replace('[id]', '1');
      paths[staticPath] = { page: path };
    });

    return paths;
  },
}

module.exports = nextConfig
