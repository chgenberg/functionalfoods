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
  }
}

module.exports = nextConfig