import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders, isAllowedOrigin, logSecurityEvent } from './app/lib/security';
import { jwtVerify } from 'jose';
// Rate limiting temporarily disabled for launch
// TODO: Configure Upstash Redis and re-enable
async function allowRequest(key: string, limit: number = 60): Promise<boolean> {
  return true; // Allow all requests for now
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Bypass all middleware logic for healthcheck endpoints
  if (path.startsWith('/api/health')) {
    return NextResponse.next();
  }

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
    // Note: Rate limiting is now async, but middleware must be sync
    // For production, consider moving rate limiting to individual API routes
    // For now, we'll rely on the rate limiting in individual API endpoints
  }

  // 3) Admin route protection (feature-flagged + report-only support)
  const adminEnabled = (process.env.ADMIN_MIDDLEWARE || 'on').toLowerCase() === 'on';
  const adminReportOnly = (process.env.ADMIN_MIDDLEWARE_REPORT_ONLY || 'on').toLowerCase() === 'on';
  const isAdminPath = path.startsWith('/admin');
  if (adminEnabled && isAdminPath) {
    // Allowlist: login and auth endpoints and static assets under admin
    const allow = (
      path === '/admin' ||
      path.startsWith('/admin/login') ||
      path.startsWith('/api/admin/auth') ||
      path.startsWith('/admin/_next') ||
      path.match(/\.(css|js|png|svg|ico|jpg|jpeg|webp)$/i) !== null
    );
    if (!allow) {
      const cookie = request.cookies.get('adminToken');
      const secret = process.env.JWT_SECRET;
      let ok = false;
      if (cookie?.value && secret) {
        try {
          const token = cookie.value;
          const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
          if ((payload as any)?.role === 'admin') ok = true;
        } catch (_) {
          ok = false;
        }
      }
      if (!ok) {
        logSecurityEvent(adminReportOnly ? 'admin_auth_report_only' : 'admin_auth_block', { path, ip: request.ip || '', ua: userAgent.substring(0,200) }, request);
        if (adminReportOnly) {
          return response; // allow but logged
        }
        const login = new URL('/admin/login', request.url);
        login.searchParams.set('next', path + (url.search || ''));
        return NextResponse.redirect(login);
      }
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
     * - api/health* (healthcheck endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/health).*)',
  ],
}; 