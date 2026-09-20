'use client';
import { useState } from 'react';
import DocumentUploader from '@/components/document/DocumentUploader';
import ChatInterface from '@/components/chat/ChatInterface';
import UsageWidget from '@/components/ui/UsageWidget';
import { MessageSquare, ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';

export default function QAPage() {
  const [text, setText] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

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
              <MessageSquare size={18} style={{ color: '#d97706' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Document Q&amp;A</span>
            </div>
          </div>
          <UsageWidget />
        </div>
      </header>

      <main id="main-content" style={{ paddingTop: '64px', minHeight: '100vh' }}>
        <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>
          {!text ? (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Ask Your Document Anything</h1>
                <p style={{ fontSize: '1.05rem' }}>Upload a legal document, then have a conversation grounded in its exact content.</p>
              </div>

              <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <DocumentUploader
                  id="qa-doc-upload"
                  label="Upload document for Q&A"
                  onTextExtracted={(t, f) => { setText(t); setFilename(f); }}
                />
              </div>

              <div className="disclaimer" style={{ marginTop: 'var(--space-8)' }}>
                <Scale size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>Answers are based strictly on the document you provide. LexAI does not give legal advice.</span>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Chatting about: <span style={{ color: 'var(--accent)' }}>{filename}</span>
                </h2>
                <button onClick={() => setText(null)} className="btn btn-outline btn-sm">
                  ← Different document
                </button>
              </div>
              <ChatInterface documentText={text} documentTitle={filename} />
              <div className="disclaimer" style={{ marginTop: 'var(--space-4)' }}>
                <Scale size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>Responses are grounded in your document. Not legal advice — consult an attorney for decisions.</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
