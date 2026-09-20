/**
 * __tests__/lib/validators.test.ts
 * Unit tests for Zod request/response validators.
 */
import { describe, it, expect } from 'vitest';
import {
  AnalyzeRequestSchema,
  CompareRequestSchema,
  QARequestSchema,
} from '@/lib/validators';

describe('AnalyzeRequestSchema', () => {
  it('accepts a valid request', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'This is a legal contract with more than fifty characters to satisfy the minimum length requirement.',
      filename: 'contract.pdf',
      mode: 'quick',
    });
    expect(result.success).toBe(true);
  });

  it('rejects text that is too short (below 50 chars)', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'Too short.',
      filename: 'contract.pdf',
    });
    expect(result.success).toBe(false);
  });

  it('defaults mode to quick when omitted', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'Some legal text that is long enough to pass the minimum character limit for the validator.',
      filename: 'doc.txt',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('quick');
    }
  });

  it('rejects invalid mode values', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'Some legal text that is long enough to pass the minimum character limit for the validator.',
      filename: 'doc.txt',
      mode: 'ultra',
    });
    expect(result.success).toBe(false);
  });
});

describe('CompareRequestSchema', () => {
  const LONG_ENOUGH = 'This is a contract section with enough characters to pass the minimum length validation check.'

  it('accepts two documents', () => {
    const result = CompareRequestSchema.safeParse({
      textA: LONG_ENOUGH,
      textB: LONG_ENOUGH + ' (modified)',
      filenameA: 'v1.pdf',
      filenameB: 'v2.pdf',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing textB', () => {
    const result = CompareRequestSchema.safeParse({
      textA: LONG_ENOUGH,
      filenameA: 'v1.pdf',
    });
    expect(result.success).toBe(false);
  });
});

describe('QARequestSchema', () => {
  const DOC_TEXT = 'This agreement can be terminated with 30 days notice and governs the relationship between parties in all jurisdictions.';

  it('accepts a valid Q&A request', () => {
    const result = QARequestSchema.safeParse({
      question: 'What is the termination clause?',
      documentText: DOC_TEXT,
      history: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a request with message history', () => {
    const result = QARequestSchema.safeParse({
      question: 'Follow-up question',
      documentText: DOC_TEXT,
      history: [
        { role: 'user', content: 'First question?' },
        { role: 'assistant', content: 'First answer.' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty question', () => {
    const result = QARequestSchema.safeParse({
      question: '',
      documentText: 'Contract text.',
      history: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects documentText that is too short', () => {
    const result = QARequestSchema.safeParse({
      question: 'What is the term?',
      documentText: 'Too short.',
      history: [],
    });
    expect(result.success).toBe(false);
  });
});
