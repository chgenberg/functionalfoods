/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Force rebuild by disabling caching
  generateBuildId: async () => {
    return `build-${Date.now()}`;
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
        source: '/Recept_complete2.0/images/_optimized/:path*',
        destination: '/api/images/Recept_complete2.0/images/_optimized/:path*',
      },
      {
        source: '/Bilder_flow/_optimized/:path*',
        destination: '/api/images/Bilder_flow/_optimized/:path*',
      },
      {
        source: '/recept_images_optimized/:path*',
        destination: '/api/images/recept_images_optimized/:path*',
      }
    ];
  }
}

module.exports = nextConfig