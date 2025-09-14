/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'ulrika-functional-foods-production.up.railway.app'],
    unoptimized: true,
  },
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
    // Disable some build optimizations to speed up
    optimizeCss: false,
  },
  swcMinify: false,
  compress: false,
  // Reduce build memory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = false;
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    }
    return config;
  },
  // Skip type checking during build to speed up
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
      // HSTS (180 days)
      { key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains; preload' },
      // Basic CSP (placeholder; adjust if needed)
      { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss:; frame-ancestors 'none'; frame-src https:" }
    ];

    return [
      // Apply security headers site-wide
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Long cache for static assets served from /_next/static
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      // Cache public assets (fingerprinted or immutable files)
      {
        source: '/public/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      // Cache images via proxy path /api/images/* with revalidation window
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