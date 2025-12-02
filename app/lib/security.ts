import { NextResponse } from 'next/server';

/**
 * Security headers for production
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // CSP is now handled by next.config.js headers() to avoid conflicts
  // Only set other security headers here
  
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Legacy XSS protection
  
  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Remove server information
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
  
  return response;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
}

/**
 * Validate Swedish phone number
 */
export function isValidSwedishPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+46|0)[1-9]\d{7,8}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available, fallback to Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * Hash password using Web Crypto API or fallback
 */
export async function hashPassword(password: string): Promise<string> {
  // In a real app, use bcrypt or similar
  // This is a basic example using built-in crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.PASSWORD_SALT || 'default-salt');
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for Node.js environment
  const nodeCrypto = require('crypto');
  return nodeCrypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'default-salt')).digest('hex');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://ulrika-functional-foods-production.up.railway.app',
    'https://functionalfoods.se',
    'https://www.functionalfoods.se'
  ];
  
  return allowedOrigins.includes(origin);
}

/**
 * CSRF token validation
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 32;
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: any, request?: Request): void {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
    userAgent: request?.headers.get('user-agent') || 'unknown'
  };
  
  // In production, send to proper logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service like Sentry, LogRocket, etc.
    console.warn('🚨 Security Event:', JSON.stringify(logData));
  } else {
    console.log('🔒 Security Event:', logData);
  }
} 