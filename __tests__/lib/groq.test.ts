import { describe, it, expect } from 'vitest';
import { parseGroqJSON, GROQ_MODELS } from '@/lib/groq';

describe('Groq Client & Helpers', () => {
  it('correctly configures OpenAI GPT-OSS model registry', () => {
    expect(GROQ_MODELS.fast).toBe('openai/gpt-oss-20b');
    expect(GROQ_MODELS.balanced).toBe('openai/gpt-oss-120b');
    expect(GROQ_MODELS.deep).toBe('openai/gpt-oss-120b');
  });

  it('parses standard JSON string response', () => {
    const json = '{"success": true, "score": 85}';
    const parsed = parseGroqJSON<{ success: boolean; score: number }>(json);
    expect(parsed.success).toBe(true);
    expect(parsed.score).toBe(85);
  });

  it('strips markdown code fences from raw AI JSON responses', () => {
    const rawFenced = '```json\n{"summary": "Test Contract", "risk": "low"}\n```';
    const parsed = parseGroqJSON<{ summary: string; risk: string }>(rawFenced);
    expect(parsed.summary).toBe('Test Contract');
    expect(parsed.risk).toBe('low');
  });

  it('handles fenced JSON with extra whitespace', () => {
    const raw = '   ```\n{\n  "status": "ok"\n}\n```  ';
    const parsed = parseGroqJSON<{ status: string }>(raw);
    expect(parsed.status).toBe('ok');
  });
});
