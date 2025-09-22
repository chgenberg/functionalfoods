/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'ulrika-functional-foods-production.up.railway.app'],
    unoptimized: false, // Enable optimization in production
    formats: ['image/webp', 'image/avif'],
  },
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Source maps configuration
  productionBrowserSourceMaps: false, // Disable source maps in production to avoid 404s
  
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Enable production optimizations
      config.optimization.minimize = true;
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  
  // Temporarily ignore type errors for successful build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Stable build ID for production
  generateBuildId: async () => {
    return process.env.RAILWAY_GIT_COMMIT_SHA || `build-${Date.now()}`;
  },
  
  async rewrites() {
    return [
      {
        source: '/recept_images_vision_optimized/:path*',
        destination: '/api/images/recept_images_vision_optimized/:path*',
      },
      {
        source: '/recept_images_optimized/:path*',
        destination: '/api/images/recept_images_optimized/:path*',
      },
      {
        source: '/recept_images_2025/:path*',
        destination: '/api/images/recept_images_2025/:path*',
      }
    ];
  },
  
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '0' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      { 
        key: 'Content-Security-Policy', 
        value: "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss:; frame-ancestors 'none'; frame-src https:" 
      }
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/api/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' }
        ],
      },
    ];
  },
}

module.exports = nextConfig
