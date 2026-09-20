'use client';
/**
 * hooks/useDocumentAnalysis.ts
 * Custom hook for fetching document analysis results from /api/analyze.
 */
import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types/analysis';

export type AnalysisMode = 'quick' | 'deep';

interface UseDocumentAnalysisReturn {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  processingTime: number | null;
  analyze: (text: string, filename: string, mode?: AnalysisMode) => Promise<void>;
  reset: () => void;
}

export function useDocumentAnalysis(): UseDocumentAnalysisReturn {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const analyze = useCallback(async (text: string, filename: string, mode: AnalysisMode = 'quick') => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename, mode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Server error: ${res.status}`);
      }

      setResult(data.data);
      setProcessingTime(data.data.processingTimeMs ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProcessingTime(null);
  }, []);

  return { result, loading, error, processingTime, analyze, reset };
}
