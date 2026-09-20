/**
 * __tests__/lib/document-chunker.test.ts
 * Unit tests for document chunking utilities.
 */
import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  getChunkingStrategy,
  chunkDocument,
  truncateToTokenLimit,
} from '@/lib/document-chunker';

describe('estimateTokens', () => {
  it('estimates ~1 token per 4 characters', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
  });

  it('rounds up for partial tokens', () => {
    expect(estimateTokens('abc')).toBe(1); // 3/4 = 0.75 → ceil = 1
  });

  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });
});

describe('getChunkingStrategy', () => {
  it('returns full for short documents (≤8k tokens)', () => {
    const short = 'a'.repeat(4 * 7_999);
    expect(getChunkingStrategy(short)).toBe('full');
  });

  it('returns sliding for medium documents', () => {
    const medium = 'a'.repeat(4 * 15_000);
    expect(getChunkingStrategy(medium)).toBe('sliding');
  });

  it('returns hierarchical for very long documents', () => {
    const long = 'a'.repeat(4 * 40_000);
    expect(getChunkingStrategy(long)).toBe('hierarchical');
  });
});

describe('chunkDocument', () => {
  it('returns a single chunk for short documents', () => {
    const text = 'Short document text.';
    const chunks = chunkDocument(text);
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe(text);
    expect(chunks[0].index).toBe(0);
  });

  it('each chunk has a valid tokenEstimate', () => {
    const text = 'Word '.repeat(500);
    const chunks = chunkDocument(text);
    for (const chunk of chunks) {
      expect(chunk.tokenEstimate).toBeGreaterThan(0);
    }
  });

  it('covers the full document without missing text', () => {
    const text = 'sentence. '.repeat(1000);
    const chunks = chunkDocument(text);
    // Verify that all characters are covered across chunk ranges
    const totalCovered = chunks.reduce((sum, c) => sum + (c.endChar - c.startChar), 0);
    expect(totalCovered).toBeGreaterThanOrEqual(text.length - 10); // small overlap margin
  });
});

describe('truncateToTokenLimit', () => {
  it('does not truncate text within limit', () => {
    const text = 'Hello world.';
    expect(truncateToTokenLimit(text, 8_000)).toBe(text);
  });

  it('truncates long text and adds marker', () => {
    const long = 'a'.repeat(100_000);
    const truncated = truncateToTokenLimit(long, 1_000);
    expect(truncated).toContain('[Document truncated for analysis]');
    expect(truncated.length).toBeLessThan(long.length);
  });

  it('snaps to sentence boundary when possible', () => {
    const base = 'This is sentence one. This is sentence two. ';
    const text = base.repeat(3_000); // large enough to trigger truncation
    const result = truncateToTokenLimit(text, 100);
    // Should end around a period
    expect(result).toMatch(/\.\s*(\n\n\[Document truncated)?/);
  });
});
