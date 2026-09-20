'use client';
/**
 * components/ui/UsageWidget.tsx
 * Real-time Groq API usage meter shown in the header.
 * Polls /api/usage every 10s and updates instantly on 'lexai-api-used' custom event.
 */
import { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface EndpointUsage {
  remaining: number;
  capacity: number;
  used: number;
  resetInMs: number;
  endpoint: string;
}

export interface UsageData {
  analyze: EndpointUsage;
  compare: EndpointUsage;
  qa: EndpointUsage;
  checklist: EndpointUsage;
  global: EndpointUsage;
}

const ENDPOINT_LABELS: Record<string, { label: string; emoji: string }> = {
  analyze:   { label: 'Analysis',   emoji: '📄' },
  compare:   { label: 'Compare',    emoji: '🔀' },
  qa:        { label: 'Q&A Chat',   emoji: '💬' },
  checklist: { label: 'Checklist',  emoji: '✅' },
  global:    { label: 'Total API',  emoji: '⚡' },
};

function formatReset(ms: number): string {
  if (ms <= 0) return 'now';
  const secs = Math.ceil(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.ceil(secs / 60)}m`;
}

function getRingColor(pct: number): string {
  if (pct >= 0.5) return 'var(--risk-low)';
  if (pct >= 0.25) return 'var(--risk-med)';
  return 'var(--risk-high)';
}

interface MiniBarProps {
  label: string;
  emoji: string;
  remaining: number;
  capacity: number;
  resetInMs: number;
}

function MiniBar({ label, emoji, remaining, capacity, resetInMs }: MiniBarProps) {
  const pct = capacity > 0 ? remaining / capacity : 0;
  const color = getRingColor(pct);
  const isLow = pct < 0.25;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>{emoji}</span> {label}
          {isLow && <AlertTriangle size={11} style={{ color: 'var(--risk-high)' }} />}
        </span>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color, fontWeight: 600 }}>
          {remaining}/{capacity}
          <span style={{ color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 400 }}>
            · {formatReset(resetInMs)}
          </span>
        </span>
      </div>
      <div style={{ height: '5px', background: 'var(--bg-surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.max(2, pct * 100)}%`,
            background: color,
            borderRadius: '3px',
            transition: 'width 0.6s var(--ease-out), background 0.3s',
            boxShadow: isLow ? `0 0 6px ${color}` : 'none',
          }}
        />
      </div>
    </div>
  );
}

export default function UsageWidget() {
  const [data, setData] = useState<UsageData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + poll every 10s + listen for instant API usage events
  useEffect(() => {
    fetchUsage();
    const timer = setInterval(fetchUsage, 10_000);
    const handleApiUsed = () => fetchUsage();

    if (typeof window !== 'undefined') {
      window.addEventListener('lexai-api-used', handleApiUsed);
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('lexai-api-used', handleApiUsed);
      }
    };
  }, [fetchUsage]);

  // Compute global health
  const globalPct = data ? (data.global.remaining / data.global.capacity) : 1;
  const isHealthy = globalPct >= 0.5;
  const isWarning = globalPct > 0 && globalPct < 0.5;
  const isExhausted = globalPct === 0;

  const statusColor = isExhausted ? 'var(--risk-high)' : isWarning ? 'var(--risk-med)' : 'var(--risk-low)';
  const StatusIcon = isExhausted ? AlertTriangle : isWarning ? AlertTriangle : CheckCircle;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button tag */}
      <button
        id="usage-widget-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="View API usage"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'var(--bg-surface)',
          border: `1px solid ${isExhausted ? 'var(--risk-high-border)' : isWarning ? 'var(--risk-med-border)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          transition: 'all 0.2s var(--ease-out)',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading
          ? <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderTopColor: 'var(--accent)' }} />
          : <Zap size={13} style={{ color: 'var(--accent)' }} />
        }
        <span style={{ color: statusColor, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {data ? `${data.global.remaining}/${data.global.capacity}` : '…'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>req/min</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="dialog"
          aria-label="API usage details"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '320px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px',
            zIndex: 200,
            animation: 'scaleIn 180ms var(--ease-out) both',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusIcon size={16} style={{ color: statusColor }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Groq API Usage Stats
              </span>
            </div>
            <button
              onClick={fetchUsage}
              aria-label="Refresh usage stats"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', borderRadius: '4px' }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Status banner */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: isExhausted ? 'var(--risk-high-dim)' : isWarning ? 'var(--risk-med-dim)' : 'var(--risk-low-dim)',
              border: `1px solid ${isExhausted ? 'var(--risk-high-border)' : isWarning ? 'var(--risk-med-border)' : 'var(--risk-low-border)'}`,
              marginBottom: '14px',
              fontSize: '0.78rem',
              color: statusColor,
              fontWeight: 500,
            }}
          >
            {isExhausted
              ? `⛔ Limit reached — resets in ${data ? formatReset(data.global.resetInMs) : '…'}`
              : isWarning
              ? `⚠️ Running low — ${data?.global.remaining} total requests left`
              : `✅ Healthy — ${data?.global.remaining} of ${data?.global.capacity} API requests available`
            }
          </div>

          {/* Per-endpoint bars */}
          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(['analyze', 'compare', 'qa', 'checklist'] as const).map((key) => {
                const ep = data[key];
                if (!ep) return null;
                const meta = ENDPOINT_LABELS[key];
                return (
                  <MiniBar
                    key={key}
                    label={meta.label}
                    emoji={meta.emoji}
                    remaining={ep.remaining}
                    capacity={ep.capacity}
                    resetInMs={ep.resetInMs}
                  />
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="spinner" style={{ width: '20px', height: '20px' }} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>1-minute sliding window</span>
            <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}</span>
          </div>

          {/* Model info */}
          <div style={{
            marginTop: '10px',
            padding: '8px 10px',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.7,
            border: '1px solid var(--border)',
          }}>
            <div style={{ color: 'var(--accent)', fontSize: '0.68rem', marginBottom: '4px', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Active Models</div>
            <div>⚡ Fast   → openai/gpt-oss-20b</div>
            <div>🧠 Deep   → openai/gpt-oss-120b</div>
          </div>
        </div>
      )}

      {/* Click-outside to close */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
