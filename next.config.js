/** @type {import('next').NextConfig} */
const nextConfig = {
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
    serverComponentsExternalPackages: ['python-shell']
  }
}

module.exports = nextConfig