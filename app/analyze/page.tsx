'use client';
import { useState } from 'react';
import DocumentUploader from '@/components/document/DocumentUploader';
import SummaryPanel from '@/components/analysis/SummaryPanel';
import RiskHeatmap from '@/components/analysis/RiskHeatmap';
import Checklist from '@/components/analysis/Checklist';
import UsageWidget from '@/components/ui/UsageWidget';
import { AnalysisResult } from '@/types/analysis';
import { Scale, FileSearch, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Tab = 'summary' | 'risks' | 'checklist';

export default function AnalyzePage() {
  const [text, setText] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('summary');
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleTextExtracted = (t: string, f: string) => {
    setText(t);
    setFilename(f);
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!text) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename, mode: 'quick' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Analysis failed');
      setResult(data.data);
      setProcessingTime(data.data.processingTimeMs);
      setTab('summary');
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

      {/* Nav */}
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
              <FileSearch size={18} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Document Analysis</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <UsageWidget />
            {processingTime && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} color="var(--accent)" /> Analyzed in {(processingTime / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" style={{ paddingTop: '64px', minHeight: '100vh' }}>
        <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>
          {!result ? (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Analyze a Legal Document</h1>
                <p style={{ fontSize: '1.05rem' }}>Upload or paste any contract, agreement, or policy to get instant AI analysis.</p>
              </div>

              <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <DocumentUploader onTextExtracted={handleTextExtracted} id="main-doc-upload" />

                {text && (
                  <div className="animate-fade-up" style={{ marginTop: 'var(--space-5)' }}>
                    <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Sparkles size={14} color="var(--accent)" />
                      <span>Ready to analyze · <strong style={{ color: 'var(--text-primary)' }}>{text.length.toLocaleString()}</strong> characters</span>
                    </div>
                    <button onClick={analyze} disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                      {loading ? (
                        <>
                          <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                          Analyzing with Groq AI…
                        </>
                      ) : (
                        <><FileSearch size={18} /> Analyze Document</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div role="alert" className="animate-fade-in" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--risk-high-dim)', border: '1px solid var(--risk-high-border)', borderRadius: 'var(--radius-md)', color: 'var(--risk-high)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div className="disclaimer" style={{ marginTop: 'var(--space-8)' }}>
                <Scale size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>LexAI provides legal information only, not legal advice. Always consult a qualified attorney for binding decisions.</span>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Analysis Complete</h2>
                <button onClick={() => { setResult(null); setText(null); }} className="btn btn-outline btn-sm">
                  ← Analyze another
                </button>
              </div>

              <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {(['summary', 'risks', 'checklist'] as Tab[]).map((t) => (
                  <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} aria-selected={tab === t} role="tab">
                    {t === 'summary' ? '📋 Summary' : t === 'risks' ? `⚠️ Risk Analysis (${result.clauses.length})` : `✅ Checklist (${result.checklist.length})`}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {tab === 'summary' && <SummaryPanel result={result} />}
                {tab === 'risks' && <RiskHeatmap clauses={result.clauses} />}
                {tab === 'checklist' && <Checklist items={result.checklist} />}
              </div>

              <div className="glass-card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>Have questions about this document?</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>Use the Q&A feature for a conversation grounded in this document.</p>
                </div>
                <Link href={`/qa?text=${encodeURIComponent(text?.slice(0, 100) ?? '')}`} className="btn btn-primary btn-sm">
                  Go to Q&amp;A →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
