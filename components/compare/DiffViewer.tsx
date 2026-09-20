'use client';
import { CompareResult } from '@/types/compare';
import { DiffEntry } from '@/types/compare';
import { Plus, Minus, ArrowLeftRight, AlertTriangle } from 'lucide-react';

const TYPE_ICONS = {
  added: <Plus size={12} />,
  removed: <Minus size={12} />,
  changed: <ArrowLeftRight size={12} />,
  same: null,
};

const SIGNIFICANCE_LABEL: Record<string, string> = {
  critical: '⚠️ Critical',
  notable: 'Notable',
  minor: 'Minor',
};

function DeltaCard({ diff }: { diff: DiffEntry }) {
  const colors = {
    added: { bg: 'var(--risk-low-dim)', border: 'var(--risk-low-border)', text: 'var(--risk-low)' },
    removed: { bg: 'var(--risk-high-dim)', border: 'var(--risk-high-border)', text: 'var(--risk-high)' },
    changed: { bg: 'var(--risk-med-dim)', border: 'var(--risk-med-border)', text: 'var(--risk-med)' },
    same: { bg: 'var(--bg-surface-2)', border: 'var(--border)', text: 'var(--text-muted)' },
  };
  const c = colors[diff.type];

  return (
    <div
      id={diff.id}
      className="animate-fade-up"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: c.text, background: `${c.border}`, padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {TYPE_ICONS[diff.type]} {diff.type}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{diff.section}</span>
        {diff.significance === 'critical' && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--risk-high)' }}>
            <AlertTriangle size={11} /> Critical
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: diff.originalText && diff.revisedText ? '1fr 1fr' : '1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        {diff.originalText && (
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-1)' }}>Original</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--risk-high)', background: 'rgba(239,68,68,0.06)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
              {diff.originalText}
            </p>
          </div>
        )}
        {diff.revisedText && (
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-1)' }}>Revised</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--risk-low)', background: 'rgba(34,197,94,0.06)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
              {diff.revisedText}
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>{diff.explanation}</p>
    </div>
  );
}

interface DiffViewerProps {
  result: CompareResult;
}

export default function DiffViewer({ result }: DiffViewerProps) {
  const criticalDiffs = result.diffs.filter((d) => d.significance === 'critical');
  const otherDiffs = result.diffs.filter((d) => d.significance !== 'critical');

  return (
    <div>
      {/* Header summary */}
      <div className="card animate-fade-up" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', marginBottom: 'var(--space-3)' }}>Comparison Summary</h3>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>{result.summary}</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total differences: <strong style={{ color: 'var(--text-primary)' }}>{result.totalDiffs}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--risk-high)' }}>
            Critical: <strong>{result.criticalDiffs}</strong>
          </span>
        </div>
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong style={{ color: 'var(--accent)' }}>Recommendation: </strong>
            {result.recommendation}
          </p>
        </div>
      </div>

      {/* Critical diffs first */}
      {criticalDiffs.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)', color: 'var(--risk-high)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={14} /> Critical Differences ({criticalDiffs.length})
          </h4>
          {criticalDiffs.map((d) => <DeltaCard key={d.id} diff={d} />)}
        </div>
      )}

      {/* Other diffs */}
      {otherDiffs.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
            Other Differences ({otherDiffs.length})
          </h4>
          {otherDiffs.map((d) => <DeltaCard key={d.id} diff={d} />)}
        </div>
      )}
    </div>
  );
}
