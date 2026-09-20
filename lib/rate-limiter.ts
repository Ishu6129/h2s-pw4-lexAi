/**
 * lib/rate-limiter.ts
 * Per-IP token-bucket rate limiter with global & endpoint-specific tracking.
 * Accurately deducts from both endpoint and global buckets.
 */
import { NextRequest } from 'next/server';

export const RATE_LIMITS = {
  analyze:   { perMinute: 10, label: 'Analysis' },
  compare:   { perMinute: 6,  label: 'Comparison' },
  qa:        { perMinute: 20, label: 'Q&A' },
  checklist: { perMinute: 10, label: 'Checklist' },
  global:    { perMinute: 30, label: 'Total API' },
} as const;

export type EndpointKey = keyof typeof RATE_LIMITS;

interface Bucket {
  tokens: number;
  capacity: number;
  used: number;
  resetAt: number;
}

interface UsageEntry {
  [endpoint: string]: Bucket;
}

const store = new Map<string, UsageEntry>();
const WINDOW_MS = 60_000; // 1 minute sliding window

/** Consistently extract IP address across all API routes */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function getOrRefillBucket(ip: string, endpoint: EndpointKey): Bucket {
  const capacity = RATE_LIMITS[endpoint].perMinute;
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry) {
    entry = {};
    store.set(ip, entry);
  }

  let bucket = entry[endpoint];
  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      tokens: capacity,
      capacity,
      used: 0,
      resetAt: now + WINDOW_MS,
    };
    entry[endpoint] = bucket;
  }

  return bucket;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  capacity: number;
  used: number;
  resetInMs: number;
  endpoint: EndpointKey;
}

/**
 * Check rate limit for a given IP and endpoint.
 * Automatically checks & deducts from BOTH the specific endpoint bucket AND global bucket.
 */
export function checkRateLimit(ip: string, endpoint: EndpointKey = 'global'): RateLimitResult {
  const now = Date.now();
  const epBucket = getOrRefillBucket(ip, endpoint);
  const globalBucket = endpoint !== 'global' ? getOrRefillBucket(ip, 'global') : epBucket;

  // Check if endpoint bucket is exhausted
  if (epBucket.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      capacity: epBucket.capacity,
      used: epBucket.used,
      resetInMs: Math.max(0, epBucket.resetAt - now),
      endpoint,
    };
  }

  // Check if global bucket is exhausted
  if (globalBucket.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      capacity: globalBucket.capacity,
      used: globalBucket.used,
      resetInMs: Math.max(0, globalBucket.resetAt - now),
      endpoint: 'global',
    };
  }

  // Deduct 1 token from endpoint bucket
  epBucket.tokens -= 1;
  epBucket.used += 1;

  // Also deduct 1 token from global bucket (if distinct)
  if (endpoint !== 'global') {
    globalBucket.tokens -= 1;
    globalBucket.used += 1;
  }

  return {
    allowed: true,
    remaining: epBucket.tokens,
    capacity: epBucket.capacity,
    used: epBucket.used,
    resetInMs: Math.max(0, epBucket.resetAt - now),
    endpoint,
  };
}

/**
 * Get snapshot of all buckets for client-side UsageWidget (polled via /api/usage).
 */
export function getUsageSnapshot(ip: string): Record<string, Omit<RateLimitResult, 'allowed'>> {
  const now = Date.now();
  const snapshot: Record<string, Omit<RateLimitResult, 'allowed'>> = {};

  for (const key of Object.keys(RATE_LIMITS) as EndpointKey[]) {
    const bucket = getOrRefillBucket(ip, key);
    snapshot[key] = {
      remaining: bucket.tokens,
      capacity: bucket.capacity,
      used: bucket.used,
      resetInMs: Math.max(0, bucket.resetAt - now),
      endpoint: key,
    };
  }

  return snapshot;
}

/** Purge expired IP entries to prevent memory leaks */
export function purgeExpiredBuckets(): void {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    const allExpired = Object.values(entry).every((b) => now >= b.resetAt);
    if (allExpired) store.delete(ip);
  }
}
