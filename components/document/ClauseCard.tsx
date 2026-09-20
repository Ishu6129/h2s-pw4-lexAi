import { Clause } from '@/types/analysis';
import Badge from '@/components/ui/Badge';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface ClauseCardProps {
  clause: Clause;
  index: number;
}

export default function ClauseCard({ clause, index }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`clause-card clause-card--${clause.riskLevel} animate-fade-up delay-${Math.min(index + 1, 5)}`}
      id={clause.id}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <Badge level={clause.riskLevel} size="sm" />
            <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {clause.title}
            </h4>
          </div>

          <blockquote
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              borderLeft: 'none',
              background: 'var(--bg-surface-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-3)',
              lineHeight: 1.6,
            }}
          >
            {clause.text.length > 180 && !expanded
              ? clause.text.slice(0, 180) + '…'
              : clause.text}
          </blockquote>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            {clause.explanation}
          </p>

          {expanded && (
            <div
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Lightbulb size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: 'var(--accent)' }}>Suggested action: </strong>
                {clause.suggestedAction}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn btn-ghost btn-sm"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse clause details' : 'Expand clause details'}
          style={{ flexShrink: 0, padding: 'var(--space-2)' }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
}
