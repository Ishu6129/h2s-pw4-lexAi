/**
 * app/api/qa/route.ts
 * POST /api/qa — Streaming Q&A grounded in document content via Groq.
 */
import { NextRequest } from 'next/server';
import { groqStream } from '@/lib/groq';
import { buildQASystemPrompt, buildQAUserPrompt } from '@/lib/prompt-templates';
import { QARequestSchema } from '@/lib/validators';
import { truncateToTokenLimit } from '@/lib/document-chunker';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { GROQ_MODELS } from '@/lib/groq';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, resetInMs } = checkRateLimit(ip, 'qa');
  if (!allowed) {
    return new Response(JSON.stringify({ success: false, error: `Rate limit exceeded. Resets in ${Math.ceil(resetInMs / 1000)}s.` }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'X-RateLimit-Reset': String(Math.ceil(resetInMs / 1000)) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = QARequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ success: false, error: parsed.error.issues[0]?.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { question, documentText, history } = parsed.data;
  const safeDoc = truncateToTokenLimit(documentText, 20_000);

  // Build message history for multi-turn context
  const messages = [
    { role: 'system' as const, content: buildQASystemPrompt(safeDoc) },
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: buildQAUserPrompt(question) },
  ];

  // Return a streaming SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream(messages, {
          model: GROQ_MODELS.fast,
          temperature: 0.2,
          maxTokens: 1024,
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Streaming failed';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
