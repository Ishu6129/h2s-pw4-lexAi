/**
 * app/api/compare/route.ts
 * POST /api/compare — Compare two legal documents via Groq.
 */
import { NextRequest, NextResponse } from 'next/server';
import { groqComplete, parseGroqJSON, GROQ_MODELS } from '@/lib/groq';
import { SYSTEM_COMPARE, buildComparePrompt } from '@/lib/prompt-templates';
import { CompareRequestSchema, CompareResultSchema } from '@/lib/validators';
import { truncateToTokenLimit } from '@/lib/document-chunker';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, 'compare');
  const { allowed, remaining, resetInMs, globalRemaining, globalCapacity } = rl;
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Resets in ${Math.ceil(resetInMs / 1000)}s.` },
      { status: 429, headers: { 'X-RateLimit-Reset': String(Math.ceil(resetInMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CompareRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const { textA, textB, filenameA, filenameB } = parsed.data;

  try {
    const start = Date.now();

    // For comparison, always use deep model — requires structural reasoning
    const safeA = truncateToTokenLimit(textA, 12_000);
    const safeB = truncateToTokenLimit(textB, 12_000);

    const raw = await groqComplete(
      [
        { role: 'system', content: SYSTEM_COMPARE },
        { role: 'user', content: buildComparePrompt(safeA, safeB, filenameA, filenameB) },
      ],
      { model: GROQ_MODELS.deep, temperature: 0.05, maxTokens: 4096, jsonMode: true }
    );

    const parsed_result = parseGroqJSON<Record<string, unknown>>(raw);
    const validated = CompareResultSchema.safeParse(parsed_result);

    if (!validated.success) {
      return NextResponse.json(
        { success: true, data: { ...parsed_result, processingTimeMs: Date.now() - start } },
        { headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...validated.data, processingTimeMs: Date.now() - start },
        rateLimit: {
          endpoint: 'compare',
          remaining,
          capacity: RATE_LIMITS.compare.perMinute,
          resetInMs,
          globalRemaining,
          globalCapacity,
        },
      },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Comparison failed';
    console.error('[/api/compare] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
