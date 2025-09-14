import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders, isAllowedOrigin, logSecurityEvent } from './app/lib/security';

// Simple in-memory rate limit (per IP, per route). For serverless, consider an external store (Upstash/Redis)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests/minute (adjust per endpoint below)

// Keep a small LRU-like store
const buckets: Record<string, { count: number; resetAt: number }> = {};

function allowRequest(key: string, limit: number) {
  const now = Date.now();
  const bucket = buckets[key] || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  bucket.count += 1;
  buckets[key] = bucket;
  return bucket.count <= limit;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers to all responses
  addSecurityHeaders(response);
  
  // CORS handling
  const origin = request.headers.get('origin');
  if (origin) {
    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else {
      // Log suspicious cross-origin requests
      logSecurityEvent('suspicious_cors_request', { origin, path: request.nextUrl.pathname }, request);
    }
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    return new Response(null, { status: 200, headers: response.headers });
  }
  
  // Security checks for suspicious requests
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;
  
  // Block common attack patterns
  const suspiciousPatterns = [
    /\.php$/i,
    /wp-admin/i,
    /wp-login/i,
    /\.env$/i,
    /config\.php$/i,
    /admin\.php$/i,
    /phpmyadmin/i,
    /\.git/i,
    /\.svn/i,
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(path) || pattern.test(request.nextUrl.search)
  );
  
  if (isSuspicious) {
    logSecurityEvent('suspicious_request_blocked', { 
      path, 
      query: request.nextUrl.search,
      userAgent: userAgent.substring(0, 200)
    }, request);
    
    return new Response('Blocked', { status: 403 });
  }
  
  // Block requests with suspicious user agents
  const maliciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /masscan/i,
    /zmap/i,
    /nmap/i,
    /dirb/i,
    /dirbuster/i,
    /gobuster/i,
    /curl.*bot/i
  ];
  
  const isMaliciousUA = maliciousUserAgents.some(pattern => pattern.test(userAgent));
  
  if (isMaliciousUA) {
    logSecurityEvent('malicious_user_agent_blocked', { 
      userAgent: userAgent.substring(0, 200),
      path 
    }, request);
    
    return new Response('Blocked', { status: 403 });
  }
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  const url = request.nextUrl;

  // 1) Force HTTPS (on production)
  const proto = request.headers.get('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && proto && proto !== 'https') {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // 2) Rate limiting for selected POST endpoints
  const pathname = url.pathname;
  const isSensitivePost = request.method === 'POST' && (
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/admin/auth') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/analyze') ||
    pathname.startsWith('/api/generate') ||
    pathname.startsWith('/api/personalized-chat') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/healthquiz')
  );

  if (isSensitivePost) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || '127.0.0.1';
    const key = `${pathname}:${ip}`;
    // Tighter limit for very sensitive endpoints
    const limit = pathname.startsWith('/api/checkout') ? 15 : 60;
    if (!allowRequest(key, limit)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 