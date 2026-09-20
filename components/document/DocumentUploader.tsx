'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, Clipboard } from 'lucide-react';

interface DocumentUploaderProps {
  onTextExtracted: (text: string, filename: string) => void;
  label?: string;
  id?: string;
}

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.md', '.rtf', '.html', '.htm', '.csv', '.json'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/** Extract plain text from Word .docx / .doc binary buffers */
async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawContent = decoder.decode(bytes);

    // Extract text from <w:t> tags in Word XML
    const matches = rawContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
      const extracted = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .join(' ');
      if (extracted.length > 30) return extracted;
    }

    // Fallback: extract clean text phrases from buffer
    const textPhrases = rawContent.match(/[A-Za-z0-9\s,.!?'"()\-:\n\r]{5,}/g);
    if (textPhrases) {
      return textPhrases
        .map((s) => s.trim())
        .filter((s) => s.length > 10 && !s.includes('Content_Types') && !s.includes('schemas.openxmlformats'))
        .join(' ');
    }
  } catch (err) {
    console.warn('Docx parsing fallback failed:', err);
  }
  return '';
}

/** Fallback raw stream text extractor for encrypted/custom PDFs */
function extractRawPdfTextFallback(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('latin1');
    const rawStr = decoder.decode(bytes);

    const textParts: string[] = [];
    const matches = rawStr.match(/\(([^()]{3,})\)\s*T[jd]/g) || rawStr.match(/\(([^()]{4,})\)/g);

    if (matches) {
      for (const match of matches) {
        const clean = match.replace(/^\(/, '').replace(/\)\s*T[jd]$/, '').replace(/\)$/, '').trim();
        if (clean.length > 3 && /[a-zA-Z0-9\s,.!?-]/.test(clean)) {
          textParts.push(clean);
        }
      }
    }
    return textParts.join(' ');
  } catch {
    return '';
  }
}

export default function DocumentUploader({
  onTextExtracted,
  label = 'Upload Document',
  id = 'doc-upload',
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      if (file.size > MAX_SIZE_BYTES) {
        setError('File too large. Maximum size is 15 MB.');
        setIsProcessing(false);
        return;
      }

      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) {
        setError(`Unsupported file type. Allowed formats: PDF, DOCX, DOC, TXT, MD, RTF, HTML, CSV`);
        setIsProcessing(false);
        return;
      }

      try {
        let text = '';
        if (ext === '.pdf') {
          text = await extractPdfText(file);
          if (text.trim().length < 20) {
            const buffer = await file.arrayBuffer();
            const fallback = extractRawPdfTextFallback(buffer);
            if (fallback.trim().length > text.trim().length) {
              text = fallback;
            }
          }
        } else if (ext === '.docx' || ext === '.doc') {
          text = await extractDocxText(file);
        } else if (ext === '.html' || ext === '.htm') {
          const rawHtml = await file.text();
          if (typeof window !== 'undefined') {
            const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
            text = doc.body.textContent || rawHtml.replace(/<[^>]+>/g, ' ');
          } else {
            text = rawHtml.replace(/<[^>]+>/g, ' ');
          }
        } else {
          text = await file.text();
        }

        const trimmed = text.trim();
        if (trimmed.length === 0) {
          setError(
            ext === '.pdf'
              ? 'No readable text found in this PDF. It may be a scanned image without selectable text. Click "Paste text" to enter document text manually.'
              : 'The document file appears to be empty. Please upload a file containing readable text content.'
          );
          setIsProcessing(false);
          return;
        }

        if (trimmed.length < 50) {
          setError(
            `Document text is too short (${trimmed.length} characters found). Minimum 50 characters required for AI analysis.`
          );
          setIsProcessing(false);
          return;
        }

        setFileName(file.name);
        onTextExtracted(trimmed, file.name);
      } catch (err) {
        console.error('File extraction error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to read document file. Try copying and pasting the text instead.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onTextExtracted]
  );

  async function extractPdfText(file: File): Promise<string> {
    try {
      const pdfjs = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      }).promise;

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .filter(Boolean)
          .join(' ');
        if (pageText.trim()) {
          pages.push(pageText.trim());
        }
      }

      return pages.join('\n\n');
    } catch (err) {
      console.error('PDF parsing error:', err);
      // Try raw buffer extraction before throwing error
      try {
        const buffer = await file.arrayBuffer();
        const raw = extractRawPdfTextFallback(buffer);
        if (raw.trim().length > 30) return raw;
      } catch {
        // ignore fallback errors
      }
      throw new Error(
        'Could not extract text from PDF. If this is a scanned PDF, please paste the text directly using the "Paste text" option.'
      );
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handlePasteSubmit = () => {
    if (pasteText.trim().length < 50) {
      setError('Text too short. Paste at least 50 characters.');
      return;
    }
    setFileName('Pasted document');
    setShowPaste(false);
    onTextExtracted(pasteText, 'Pasted document');
  };

  if (showPaste) {
    return (
      <div className="animate-scale-in">
        <label htmlFor={`${id}-paste`} style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Paste document text
        </label>
        <textarea
          id={`${id}-paste`}
          className="textarea"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your contract or legal document text here..."
          style={{ minHeight: '220px' }}
          aria-label="Document text input"
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <button onClick={handlePasteSubmit} className="btn btn-primary" disabled={pasteText.trim().length < 50}>
            Analyze Text
          </button>
          <button onClick={() => setShowPaste(false)} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-label={`${label}. Drag and drop a file or click to browse`}
        className={`drop-zone${isDragging ? ' drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? fileInputRef.current?.click() : null}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Extracting document text...</p>
            </div>
          ) : fileName ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <FileText size={24} />
              </div>
              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{fileName}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to replace</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Upload size={28} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  Drop your document here
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  PDF, DOCX, DOC, TXT, MD, RTF, HTML · Max 15 MB
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Browse files</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or</span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                  onClick={(e) => { e.stopPropagation(); setShowPaste(true); }}
                  aria-label="Paste document text instead"
                >
                  <Clipboard size={12} /> Paste text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap',
            marginTop: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)',
            background: 'var(--risk-high-dim)', border: '1px solid var(--risk-high-border)',
            borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--risk-high)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            <button
              onClick={() => { setError(null); setShowPaste(true); }}
              className="btn btn-outline btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.78rem', borderColor: 'var(--risk-high-border)', color: 'var(--risk-high)' }}
            >
              <Clipboard size={12} /> Paste text manually
            </button>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.rtf,.html,.htm,.csv,.json,text/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        aria-hidden="true"
      />
    </div>
  );
}
