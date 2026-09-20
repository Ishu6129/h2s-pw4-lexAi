/**
 * lib/groq.ts
 * Groq API client singleton with typed helpers.
 * Key never leaves this server-side module — never imported from client components.
 */
import Groq from 'groq-sdk';

// ─── Model Registry ────────────────────────────────────────────────────────────

export const GROQ_MODELS = {
  /** Fast model — Q&A streaming, checklists, quick tasks */
  fast: 'openai/gpt-oss-20b',
  /** Balanced model — document analysis, summarization */
  balanced: 'openai/gpt-oss-120b',
  /** Deep model — contract comparison, complex reasoning */
  deep: 'openai/gpt-oss-120b',
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

// ─── Singleton ─────────────────────────────────────────────────────────────────

let _client: Groq | null = null;

function getClient(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    _client = new Groq({ apiKey });
  }
  return _client;
}

// ─── Typed Request Helpers ─────────────────────────────────────────────────────

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: GroqModel;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Non-streaming completion — returns full response string.
 * Used for: analysis, comparison, checklists.
 */
export async function groqComplete(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const client = getClient();
  const {
    model = GROQ_MODELS.balanced,
    temperature = 0.1,
    maxTokens = 4096,
    jsonMode = false,
  } = options;

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  });

  return completion.choices[0]?.message?.content ?? '';
}

/**
 * Streaming completion — yields text chunks.
 * Used for: Q&A chat interface.
 */
export async function* groqStream(
  messages: GroqMessage[],
  options: GroqOptions = {}
): AsyncGenerator<string> {
  const client = getClient();
  const { model = GROQ_MODELS.fast, temperature = 0.2, maxTokens = 2048 } = options;

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/**
 * Parse JSON from Groq response — strips markdown code fences if present.
 */
export function parseGroqJSON<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
