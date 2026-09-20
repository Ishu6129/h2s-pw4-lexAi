/**
 * app/api/analyze/route.ts
 * POST /api/analyze — Analyze a legal document via Groq.
 */
import { NextRequest, NextResponse } from 'next/server';
import { groqComplete, parseGroqJSON, GROQ_MODELS } from '@/lib/groq';
import { SYSTEM_ANALYZE, buildAnalyzePrompt } from '@/lib/prompt-templates';
import { AnalyzeRequestSchema, AnalysisResultSchema } from '@/lib/validators';
import { truncateToTokenLimit } from '@/lib/document-chunker';
import { scoreDocument } from '@/lib/risk-classifier';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const { allowed, remaining, resetInMs } = checkRateLimit(ip, 'analyze');
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Resets in ${Math.ceil(resetInMs / 1000)}s.` },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetInMs / 1000)),
        }
      }
    );
  }

  // ── Parse & validate input ───────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const { text, filename, mode } = parsed.data;

  try {
    const start = Date.now();

    // ── Model selection based on document complexity ──────────────────────────
    const { highRiskCount } = scoreDocument(text);
    const useDeepModel = mode === 'deep' || highRiskCount >= 3;
    const model = useDeepModel ? GROQ_MODELS.deep : GROQ_MODELS.balanced;

    // ── Truncate if needed ────────────────────────────────────────────────────
    const safeText = truncateToTokenLimit(text, 24_000);

    // ── Groq completion ───────────────────────────────────────────────────────
    const raw = await groqComplete(
      [
        { role: 'system', content: SYSTEM_ANALYZE },
        { role: 'user', content: buildAnalyzePrompt(safeText, filename) },
      ],
      { model, temperature: 0.05, maxTokens: 4096, jsonMode: true }
    );

    // ── Parse and validate response ───────────────────────────────────────────
    const parsed_result = parseGroqJSON<Record<string, unknown>>(raw);
    const validated = AnalysisResultSchema.safeParse(parsed_result);

    if (!validated.success) {
      // Return raw if schema mismatch — graceful degradation
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
          endpoint: 'analyze',
          remaining,
          capacity: 10,
          resetInMs,
        },
      },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    console.error('[/api/analyze] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
