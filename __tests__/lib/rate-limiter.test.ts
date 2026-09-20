import { describe, it, expect } from 'vitest';
import { checkRateLimit, getUsageSnapshot, purgeExpiredBuckets, RATE_LIMITS } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  const testIp = '192.168.1.100';

  it('allows requests within capacity limits', () => {
    const result = checkRateLimit(testIp, 'analyze');
    expect(result.allowed).toBe(true);
    expect(result.capacity).toBe(RATE_LIMITS.analyze.perMinute);
    expect(result.remaining).toBeLessThan(RATE_LIMITS.analyze.perMinute);
  });

  it('correctly tracks endpoint capacity and usage', () => {
    const ip = '10.0.0.1';
    const snapshotBefore = getUsageSnapshot(ip);
    expect(snapshotBefore.compare.remaining).toBe(RATE_LIMITS.compare.perMinute);

    checkRateLimit(ip, 'compare');
    const snapshotAfter = getUsageSnapshot(ip);
    expect(snapshotAfter.compare.remaining).toBe(RATE_LIMITS.compare.perMinute - 1);
  });

  it('blocks requests when capacity is exhausted', () => {
    const ip = '172.16.0.5';
    const limit = RATE_LIMITS.compare.perMinute;

    for (let i = 0; i < limit; i++) {
      const res = checkRateLimit(ip, 'compare');
      expect(res.allowed).toBe(true);
    }

    // Next request should be blocked
    const blockedRes = checkRateLimit(ip, 'compare');
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetInMs).toBeGreaterThan(0);
  });

  it('generates a full usage snapshot for all endpoints', () => {
    const snapshot = getUsageSnapshot('127.0.0.1');
    expect(snapshot).toHaveProperty('analyze');
    expect(snapshot).toHaveProperty('compare');
    expect(snapshot).toHaveProperty('qa');
    expect(snapshot).toHaveProperty('checklist');
    expect(snapshot).toHaveProperty('global');
  });

  it('purges expired buckets cleanly', () => {
    expect(() => purgeExpiredBuckets()).not.toThrow();
  });
});
