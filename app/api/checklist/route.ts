/**
 * app/api/checklist/route.ts
 * POST /api/checklist — Generate an action checklist from a legal document.
 */
import { NextRequest, NextResponse } from 'next/server';
import { groqComplete, parseGroqJSON, GROQ_MODELS } from '@/lib/groq';
import { SYSTEM_CHECKLIST, buildChecklistPrompt } from '@/lib/prompt-templates';
import { ChecklistRequestSchema } from '@/lib/validators';
import { truncateToTokenLimit } from '@/lib/document-chunker';
import { checkRateLimit } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { allowed } = checkRateLimit(ip, 'checklist');
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ChecklistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const safeText = truncateToTokenLimit(parsed.data.text, 16_000);

  try {
    const raw = await groqComplete(
      [
        { role: 'system', content: SYSTEM_CHECKLIST },
        { role: 'user', content: buildChecklistPrompt(safeText) },
      ],
      { model: GROQ_MODELS.balanced, temperature: 0.1, maxTokens: 2048, jsonMode: true }
    );

    const result = parseGroqJSON<{ checklist: unknown[] }>(raw);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checklist generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
