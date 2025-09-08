/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Force rebuild by disabling caching
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  // Disable static optimization for dynamic routes
  trailingSlash: false,
  // Clear caches
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  async rewrites() {
    return [
      {
        source: '/recept_images_optimized/:path*',
        destination: '/api/images/recept_images_optimized/:path*',
      },
      {
        source: '/recept_images_2025/:path*',
        destination: '/api/images/recept_images_2025/:path*',
      }
    ];
  }
}

module.exports = nextConfig