/**
 * app/api/usage/route.ts
 * GET /api/usage — Returns the current rate-limit usage for the requester's IP.
 * Used by the client-side Usage Widget to show remaining requests.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUsageSnapshot, getClientIp } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const snapshot = getUsageSnapshot(ip);

  return NextResponse.json({
    success: true,
    data: snapshot,
    timestamp: Date.now(),
  });
}
