import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  }
} catch (e) {
  redis = null;
}

const mem = new Map<string, { value: any; expireAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    const val = await redis.get<T>(key);
    return (val as T) || null;
  }
  const item = mem.get(key);
  if (!item) return null;
  if (Date.now() > item.expireAt) {
    mem.delete(key);
    return null;
  }
  return item.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (redis) {
    await redis.set(key, value as any, { ex: ttlSeconds });
    return;
  }
  mem.set(key, { value, expireAt: Date.now() + ttlSeconds * 1000 });
} 