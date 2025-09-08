import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  
  constructor(private options: RateLimitOptions) {}
  
  private getKey(request: NextRequest): string {
    // Use IP address as key, fallback to user agent for localhost
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'localhost';
    
    // Include user agent for better identification in development
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}-${userAgent.substring(0, 50)}`;
  }
  
  private cleanExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
  
  async isAllowed(request: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  }> {
    this.cleanExpiredEntries();
    
    const key = this.getKey(request);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime: now + this.options.windowMs
      };
      
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }
    
    if (this.store[key].count >= this.options.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime,
        message: this.options.message || 'Too many requests'
      };
    }
    
    // Increment counter
    this.store[key].count++;
    
    return {
      allowed: true,
      remaining: this.options.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.'
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'För många förfrågningar. Försök igen om en minut.'
});

export const checkoutRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 checkout attempts per minute
  message: 'För många beställningsförsök. Försök igen om en minut.'
});

export const contactRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 contact form submissions per hour
  message: 'För många meddelanden skickade. Försök igen om en timme.'
});

// Helper function to apply rate limiting to API routes
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  handler: () => Promise<Response>
): Promise<Response> {
  const result = await rateLimiter.isAllowed(request);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ 
        error: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimiter['options'].maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        }
      }
    );
  }
  
  // Add rate limit headers to successful responses
  const response = await handler();
  
  response.headers.set('X-RateLimit-Limit', rateLimiter['options'].maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  
  return response;
} 