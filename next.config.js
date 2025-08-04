/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force new build by adding generateBuildId
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  // Explicit env vars for Railway compatibility
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  
  // Behåll dina befintliga inställningar
  reactStrictMode: true,
  swcMinify: true,

  // Lägg till TypeScript-hantering
  typescript: {
    // !! VARNING !!
    // Detta är bara för utveckling, ta bort i produktion
    ignoreBuildErrors: true,
  },

  // Lägg till Python-filhantering
  webpack: (config) => {
    config.module.rules.push({
      test: /\.py$/,
      use: 'raw-loader'
    });
    return config;
  },

  // Lägg till Python-stöd för API-routes
  experimental: {
    serverComponentsExternalPackages: ['python-shell', '@prisma/client']
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'functionalfoods.se',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/scraped_content_basic/:path*',
        destination: '/api/scraped-content/:path*',
      },
    ]
  },
}

module.exports = nextConfig