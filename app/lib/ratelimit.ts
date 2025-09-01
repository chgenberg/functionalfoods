import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Export a factory to create per-route limiters with shared backend
export function createRateLimiter(identifier: string, opts?: { requests: number; window: string }) {
  const requests = opts?.requests ?? 60; // default 60 req
  const windowStr = opts?.window ?? '60 s';
  const windowSeconds = parseInt((windowStr.split(' ')[0] || '60'), 10);

  let limiter: Ratelimit | null = null;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s` as any),
        analytics: false,
        prefix: `rate:${identifier}`,
      });
    }
  } catch (e) {
    limiter = null;
  }

  // In-memory fallback (per-instance only)
  const memMap = new Map<string, number[]>();
  const memWindowMs = windowSeconds * 1000;

  async function limit(key: string) {
    // Prefer Upstash if available
    if (limiter) {
      const res = await limiter.limit(key);
      return { success: res.success, reset: res.reset, remaining: res.remaining, retryAfter: res.reset - Date.now() };
    }
    const now = Date.now();
    const start = now - memWindowMs;
    const arr = memMap.get(key) || [];
    const recent = arr.filter((t) => t > start);
    if (recent.length >= requests) {
      memMap.set(key, recent);
      return { success: false, reset: start + memWindowMs, remaining: 0, retryAfter: 60_000 };
    }
    recent.push(now);
    memMap.set(key, recent);
    return { success: true, reset: now + memWindowMs, remaining: requests - recent.length, retryAfter: 0 };
  }

  return { limit };
} 