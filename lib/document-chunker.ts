/**
 * lib/document-chunker.ts
 * Smart document chunking for large documents.
 * Prevents token overflow and enables map-reduce for long docs.
 */

export interface Chunk {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
  tokenEstimate: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
// Groq Llama 3.3 70B context: 128k tokens. We stay conservative.
const CHARS_PER_TOKEN = 4; // rough estimate
const MAX_CHUNK_TOKENS = 8_000;
const OVERLAP_CHARS = 200;
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN; // 32,000

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Decide the processing strategy based on document size.
 */
export function getChunkingStrategy(text: string): 'full' | 'sliding' | 'hierarchical' {
  const tokens = estimateTokens(text);
  if (tokens <= 8_000) return 'full';
  if (tokens <= 32_000) return 'sliding';
  return 'hierarchical';
}

/**
 * Split text into overlapping chunks at paragraph/sentence boundaries.
 */
export function chunkDocument(text: string): Chunk[] {
  const strategy = getChunkingStrategy(text);

  if (strategy === 'full') {
    return [
      {
        index: 0,
        text,
        startChar: 0,
        endChar: text.length,
        tokenEstimate: estimateTokens(text),
      },
    ];
  }

  const chunks: Chunk[] = [];
  let position = 0;
  let chunkIndex = 0;

  while (position < text.length) {
    const end = Math.min(position + MAX_CHUNK_CHARS, text.length);
    let chunkEnd = end;

    // Snap to paragraph boundary if not at end
    if (end < text.length) {
      const lookBack = text.lastIndexOf('\n\n', end);
      if (lookBack > position + MAX_CHUNK_CHARS * 0.5) {
        chunkEnd = lookBack;
      } else {
        // Snap to sentence boundary
        const sentenceEnd = text.lastIndexOf('. ', end);
        if (sentenceEnd > position + MAX_CHUNK_CHARS * 0.5) {
          chunkEnd = sentenceEnd + 1;
        }
      }
    }

    const chunkText = text.slice(position, chunkEnd).trim();
    if (chunkText.length > 0) {
      chunks.push({
        index: chunkIndex++,
        text: chunkText,
        startChar: position,
        endChar: chunkEnd,
        tokenEstimate: estimateTokens(chunkText),
      });
    }

    // Move with overlap to preserve context across chunks
    position = Math.max(chunkEnd - OVERLAP_CHARS, chunkEnd);
    if (position >= text.length) break;
  }

  return chunks;
}

/**
 * Truncate text to fit within a token limit (server-side safety net).
 */
export function truncateToTokenLimit(text: string, maxTokens: number = 8_000): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;

  // Snap to sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('. ');
  return lastPeriod > maxChars * 0.8
    ? truncated.slice(0, lastPeriod + 1) + '\n\n[Document truncated for analysis]'
    : truncated + '\n\n[Document truncated for analysis]';
}
