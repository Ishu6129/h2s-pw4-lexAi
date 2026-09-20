import Link from 'next/link';
import { Scale, FileSearch, GitCompare, MessageSquare, ArrowRight, Shield, Zap, Lock, Sparkles } from 'lucide-react';
import UsageWidget from '@/components/ui/UsageWidget';

const features = [
  {
    icon: <FileSearch size={24} style={{ color: 'var(--accent)' }} />,
    title: 'Document Analysis',
    description:
      'Upload any contract, agreement, or policy. Get a plain-English summary, key parties, dates, and risk flags — in seconds.',
    href: '/analyze',
    cta: 'Analyze a document',
  },
  {
    icon: <GitCompare size={24} style={{ color: '#7c3aed' }} />,
    title: 'Contract Comparison',
    description:
      'Side-by-side diff of two document versions. Instantly see what changed, what was added, and what was removed — with risk context.',
    href: '/compare',
    cta: 'Compare contracts',
  },
  {
    icon: <MessageSquare size={24} style={{ color: '#d97706' }} />,
    title: 'Document Q&A',
    description:
      "Ask anything about your document. Our AI answers based strictly on the document content — no hallucinations, just facts.",
    href: '/qa',
    cta: 'Start a conversation',
  },
];

const trustItems = [
  { icon: <Shield size={16} />, text: 'Documents never stored' },
  { icon: <Lock size={16} />, text: 'Processed in-memory only' },
  { icon: <Zap size={16} />, text: 'Powered by Groq AI' },
];

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 21st.dev Ambient shapes */}
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={20} color="var(--accent)" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              Lex<span className="gradient-text">AI</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link href="/analyze" className="btn btn-ghost btn-sm">Analyze</Link>
            <Link href="/compare" className="btn btn-ghost btn-sm">Compare</Link>
            <Link href="/qa" className="btn btn-ghost btn-sm">Q&amp;A</Link>
            <UsageWidget />
            <Link href="/analyze" className="btn btn-primary btn-sm">Get Started</Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section style={{ paddingTop: 'calc(var(--space-20) + 64px)', paddingBottom: 'var(--space-16)', textAlign: 'center', position: 'relative' }}>
          <div className="container" style={{ maxWidth: '840px' }}>
            <div
              className="animate-fade-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: '0.8rem',
                color: 'var(--accent)',
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginBottom: 'var(--space-6)',
              }}
            >
              <Sparkles size={14} />
              Powered by Groq AI · Ultra-Fast Legal Intelligence
            </div>

            <h1 className="animate-fade-up" style={{ marginBottom: 'var(--space-5)' }}>
              Understand Any Legal Document{' '}
              <span className="gradient-text">in Plain English</span>
            </h1>

            <p
              className="animate-fade-up"
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-8)',
                maxWidth: '640px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Upload contracts, agreements, or policies. Get instant AI-powered risk analysis,
              clause classification, and actionable summaries. No legal jargon required.
            </p>

            <div className="animate-fade-up" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/analyze" className="btn btn-primary btn-lg">
                Analyze Document <ArrowRight size={18} />
              </Link>
              <Link href="/compare" className="btn btn-secondary btn-lg">
                Compare Contracts
              </Link>
            </div>

            {/* Trust Badges */}
            <div
              className="animate-fade-up"
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                justifyContent: 'center',
                marginTop: 'var(--space-10)',
                flexWrap: 'wrap',
              }}
            >
              {trustItems.map(({ icon, text }) => (
                <span
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: 'var(--accent)' }}>{icon}</span>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: 'var(--space-16) 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2>Everything You Need to Navigate Contracts</h2>
              <p style={{ marginTop: 'var(--space-2)', fontSize: '1.05rem' }}>
                Three powerful tools built for clarity, speed, and precision
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {features.map(({ icon, title, description, href, cta }) => (
                <div key={title} className="glass-card-interactive" style={{ padding: 'var(--space-8)' }}>
                  <div style={{ width: '52px', height: '52px', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                    {icon}
                  </div>
                  <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '1.2rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.925rem', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>{description}</p>
                  <Link href={href} className="btn btn-outline btn-sm">
                    {cta} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: 'var(--space-16) 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
              <h2>How LexAI Works</h2>
              <p style={{ fontSize: '1rem', marginTop: 'var(--space-2)' }}>From complex PDF to clear insights in 3 simple steps</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { step: '01', title: 'Upload or Paste Document', desc: 'Drop any PDF or paste text directly. Supports contracts, NDAs, leases, terms of service, and policies.' },
                { step: '02', title: 'AI Risk & Clause Classification', desc: 'Groq AI (GPT-OSS 120B) analyzes text, scores overall risk, categorizes clauses into High, Medium, and Low risk levels.' },
                { step: '03', title: 'Interactive Insights & Action Plan', desc: 'Review the plain-English summary, ask questions in real-time Q&A, and follow the generated action checklist.' },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    gap: 'var(--space-5)',
                    alignItems: 'flex-start',
                    padding: 'var(--space-6)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      flexShrink: 0,
                    }}
                  >
                    {step}
                  </span>
                  <div>
                    <h4 style={{ marginBottom: 'var(--space-1)', fontSize: '1.1rem' }}>{title}</h4>
                    <p style={{ fontSize: '0.925rem' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section style={{ paddingBottom: 'var(--space-16)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="disclaimer">
              <Scale size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Disclaimer:</strong> LexAI provides AI-generated legal assistance and information, not formal legal advice. Always consult a licensed attorney for binding legal matters.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-8) 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Scale size={18} color="var(--accent)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>LexAI</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Legal Intelligence Platform
            </p>
            <nav style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Link href="/analyze" className="btn btn-ghost btn-sm">Analyze</Link>
              <Link href="/compare" className="btn btn-ghost btn-sm">Compare</Link>
              <Link href="/qa" className="btn btn-ghost btn-sm">Q&amp;A</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
