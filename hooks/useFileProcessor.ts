'use client';
/**
 * hooks/useFileProcessor.ts
 * Handles file selection, PDF text extraction, and character limit enforcement.
 */
import { useState, useCallback } from 'react';

const MAX_CHARS = 200_000; // ~50k tokens

interface UseFileProcessorReturn {
  text: string | null;
  filename: string;
  processing: boolean;
  error: string | null;
  processFile: (file: File) => Promise<void>;
  processText: (rawText: string, name?: string) => void;
  reset: () => void;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return pages.join('\n\n');
}

export function useFileProcessor(): UseFileProcessorReturn {
  const [text, setText] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setProcessing(true);
    setError(null);

    try {
      let extracted: string;

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extracted = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        extracted = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or plain text file.');
      }

      if (!extracted.trim()) throw new Error('No text could be extracted from this file.');
      if (extracted.length > MAX_CHARS) {
        extracted = extracted.slice(0, MAX_CHARS);
      }

      setFilename(file.name);
      setText(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file.');
      setText(null);
    } finally {
      setProcessing(false);
    }
  }, []);

  const processText = useCallback((rawText: string, name = 'Pasted text') => {
    if (!rawText.trim()) {
      setError('Please paste some text first.');
      return;
    }
    setFilename(name);
    setText(rawText.slice(0, MAX_CHARS));
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setText(null);
    setFilename('');
    setError(null);
  }, []);

  return { text, filename, processing, error, processFile, processText, reset };
}
