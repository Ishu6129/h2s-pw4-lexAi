import { Clause, RiskLevel } from '@/types/analysis';
import Badge from '@/components/ui/Badge';
import ClauseCard from '@/components/document/ClauseCard';
import { Filter } from 'lucide-react';
import { useState } from 'react';

interface RiskHeatmapProps {
  clauses: Clause[];
}

const RISK_ORDER: RiskLevel[] = ['high', 'medium', 'low', 'info'];

export default function RiskHeatmap({ clauses }: RiskHeatmapProps) {
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');

  const counts = RISK_ORDER.reduce(
    (acc, lvl) => ({ ...acc, [lvl]: clauses.filter((c) => c.riskLevel === lvl).length }),
    {} as Record<RiskLevel, number>
  );

  const filtered = filter === 'all' ? clauses : clauses.filter((c) => c.riskLevel === filter);
  const sorted = [...filtered].sort((a, b) => RISK_ORDER.indexOf(a.riskLevel) - RISK_ORDER.indexOf(b.riskLevel));

  return (
    <section aria-labelledby="risk-heatmap-title">
      {/* Summary stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {RISK_ORDER.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(filter === lvl ? 'all' : lvl)}
            className={`card${filter === lvl ? '' : ''}`}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${filter === lvl ? `var(--risk-${lvl}-border, var(--accent-border))` : 'var(--border)'}`,
              background: filter === lvl ? `var(--risk-${lvl}-dim, var(--accent-dim))` : 'var(--bg-surface)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-fast)',
            }}
            aria-pressed={filter === lvl}
            aria-label={`Filter by ${lvl} risk — ${counts[lvl]} clauses`}
          >
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: lvl === 'high' ? 'var(--risk-high)' : lvl === 'medium' ? 'var(--risk-med)' : lvl === 'low' ? 'var(--risk-low)' : 'var(--risk-info)',
              }}
            >
              {counts[lvl]}
            </div>
            <Badge level={lvl} size="sm" />
          </button>
        ))}
      </div>

      {/* Clause list */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <h3 id="risk-heatmap-title" style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          {filter === 'all' ? `All Clauses (${clauses.length})` : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Risk (${filtered.length})`}
        </h3>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
            Show all
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
          No clauses found for this filter.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {sorted.map((clause, i) => (
            <ClauseCard key={clause.id} clause={clause} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
