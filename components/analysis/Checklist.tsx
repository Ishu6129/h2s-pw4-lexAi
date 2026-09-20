'use client';
import { useState } from 'react';
import { ChecklistItem } from '@/types/analysis';
import { CheckSquare, Square, Download } from 'lucide-react';

const PRIORITY_COLORS = {
  urgent: 'var(--risk-high)',
  important: 'var(--risk-med)',
  optional: 'var(--text-muted)',
};

const CATEGORY_LABELS = {
  review: 'Review',
  negotiate: 'Negotiate',
  clarify: 'Clarify',
  lawyer: '⚖️ Ask Lawyer',
};

interface ChecklistProps {
  items: ChecklistItem[];
}

export default function Checklist({ items }: ChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exportText = () => {
    const lines = items.map((item) => {
      const done = checked.has(item.id) ? '[x]' : '[ ]';
      return `${done} [${item.priority.toUpperCase()}] ${item.action}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-action-checklist.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const doneCount = checked.size;

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', marginBottom: 'var(--space-1)' }}>
            Action Checklist
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {doneCount}/{items.length} completed
          </p>
        </div>
        <button onClick={exportText} className="btn btn-outline btn-sm" aria-label="Export checklist as text file">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }} role="progressbar" aria-valuenow={doneCount} aria-valuemax={items.length} aria-label="Checklist progress">
        <div className="progress-bar__fill" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {items.map((item) => {
          const isDone = checked.has(item.id);
          return (
            <div
              key={item.id}
              className={`checklist-item${isDone ? ' done' : ''}`}
              onClick={() => toggle(item.id)}
              role="checkbox"
              aria-checked={isDone}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(item.id)}
            >
              <div className={`checklist-checkbox${isDone ? ' checked' : ''}`} aria-hidden="true">
                {isDone && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="checklist-action" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {item.action}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORITY_COLORS[item.priority], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.priority}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
