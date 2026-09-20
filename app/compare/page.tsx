'use client';
import { useState } from 'react';
import DocumentUploader from '@/components/document/DocumentUploader';
import DiffViewer from '@/components/compare/DiffViewer';
import UsageWidget from '@/components/ui/UsageWidget';
import { CompareResult } from '@/types/compare';
import { GitCompare, ArrowLeft, AlertCircle, Scale } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const [textA, setTextA] = useState<string | null>(null);
  const [textB, setTextB] = useState<string | null>(null);
  const [filenameA, setFilenameA] = useState('Document A');
  const [filenameB, setFilenameB] = useState('Document B');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = async () => {
    if (!textA || !textB) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textA, textB, filenameA, filenameB }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Comparison failed');
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexai-api-used'));
      }
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div className="bg-ambient-blob-1" />
      <div className="bg-ambient-blob-2" />
      <div className="bg-dot-pattern" />

      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-2)' }}>
              <ArrowLeft size={14} /> Home
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitCompare size={18} style={{ color: '#7c3aed' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Contract Comparison</span>
            </div>
          </div>
          <UsageWidget />
        </div>
      </header>

      <main id="main-content" style={{ paddingTop: '64px', minHeight: '100vh' }}>
        <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>
          {!result ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Compare Two Documents</h1>
                <p style={{ fontSize: '1.05rem' }}>Upload two versions of a contract or agreement to see exactly what changed.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    📄 Document A — Original
                  </label>
                  <DocumentUploader
                    id="doc-a-upload"
                    label="Upload Document A"
                    onTextExtracted={(t, f) => { setTextA(t); setFilenameA(f); }}
                  />
                </div>
                <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    📑 Document B — Revised
                  </label>
                  <DocumentUploader
                    id="doc-b-upload"
                    label="Upload Document B"
                    onTextExtracted={(t, f) => { setTextB(t); setFilenameB(f); }}
                  />
                </div>
              </div>

              {textA && textB && (
                <div className="animate-fade-up" style={{ textAlign: 'center' }}>
                  <button onClick={compare} disabled={loading} className="btn btn-primary btn-lg">
                    {loading ? (
                      <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Comparing…</>
                    ) : (
                      <><GitCompare size={18} /> Compare Documents</>
                    )}
                  </button>
                  <p style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Both documents uploaded cleanly. Ready to compare.
                  </p>
                </div>
              )}

              {error && (
                <div role="alert" style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--risk-high-dim)', border: '1px solid var(--risk-high-border)', borderRadius: 'var(--radius-md)', color: 'var(--risk-high)', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="disclaimer" style={{ marginTop: 'var(--space-8)' }}>
                <Scale size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>LexAI provides legal information only. Consult a qualified attorney before making decisions based on this comparison.</span>
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Comparison Complete</h2>
                  <p style={{ fontSize: '0.875rem', margin: '4px 0 0', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{result.docATitle}</strong>
                    {' vs '}
                    <strong style={{ color: 'var(--text-primary)' }}>{result.docBTitle}</strong>
                  </p>
                </div>
                <button onClick={() => { setResult(null); setTextA(null); setTextB(null); }} className="btn btn-outline btn-sm">
                  ← Compare again
                </button>
              </div>
              <DiffViewer result={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
