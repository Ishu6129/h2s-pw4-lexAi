import { AnalysisResult } from '@/types/analysis';
import { FileText, Users, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface SummaryPanelProps {
  result: AnalysisResult;
}

export default function SummaryPanel({ result }: SummaryPanelProps) {
  const metaItems = [
    { icon: <Users size={14} />, label: 'Parties', value: result.keyParties.join(', ') || 'Not specified' },
    { icon: <Calendar size={14} />, label: 'Effective Date', value: result.effectiveDate ?? 'Not specified' },
    { icon: <MapPin size={14} />, label: 'Jurisdiction', value: result.jurisdiction ?? 'Not specified' },
  ];

  return (
    <div className="card animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', marginBottom: '2px' }}>
              {result.documentTitle}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document summary</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall risk:</span>
          <Badge level={result.overallRisk} size="sm" />
        </div>
      </div>

      {/* Summary text */}
      <p
        style={{
          fontSize: '0.925rem',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-5)',
          padding: 'var(--space-4)',
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--accent-border)',
        }}
      >
        {result.summary}
      </p>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {metaItems.map(({ icon, label, value }) => (
          <div
            key={label}
            style={{
              padding: 'var(--space-3)',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <span style={{ color: 'var(--accent)' }}>{icon}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
