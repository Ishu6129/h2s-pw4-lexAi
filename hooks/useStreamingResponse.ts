'use client';
/**
 * hooks/useStreamingResponse.ts
 * Custom hook for consuming SSE streams from /api/qa.
 */
import { useState, useCallback, useRef } from 'react';

interface StreamOptions {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

interface UseStreamingReturn {
  streaming: boolean;
  abort: () => void;
  startStream: (payload: Record<string, unknown>, opts: StreamOptions) => Promise<void>;
}

export function useStreamingResponse(endpoint: string): UseStreamingReturn {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const startStream = useCallback(
    async (payload: Record<string, unknown>, opts: StreamOptions) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
              opts.onDone();
              return;
            }
            try {
              const parsed = JSON.parse(raw) as { chunk?: string; error?: string };
              if (parsed.error) {
                opts.onError(parsed.error);
                return;
              }
              if (parsed.chunk) opts.onChunk(parsed.chunk);
            } catch {
              // malformed SSE — skip
            }
          }
        }

        opts.onDone();
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          opts.onError(err instanceof Error ? err.message : 'Stream failed');
        }
      } finally {
        setStreaming(false);
      }
    },
    [endpoint]
  );

  return { streaming, abort, startStream };
}
