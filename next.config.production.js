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
  
  // Enable type checking in production
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
        value: "default-src 'self'; img-src 'self' data: blob: https: http:; media-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://js.stripe.com https://checkoutapi.svea.com https://*.svea.com https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://checkoutapi.svea.com https://*.svea.com https: wss:; frame-ancestors 'none'; frame-src https://checkoutapi.svea.com https://*.svea.com https:" 
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
