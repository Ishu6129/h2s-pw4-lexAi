import { RiskLevel } from '@/types/analysis';

interface BadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const RISK_LABELS: Record<RiskLevel, string> = {
  high: '🔴 High Risk',
  medium: '🟡 Medium Risk',
  low: '🟢 Low Risk',
  info: '🔵 Info',
};

export default function Badge({ level, size = 'md' }: BadgeProps) {
  return (
    <span
      className={`badge badge-${level}`}
      style={size === 'sm' ? { fontSize: '0.65rem', padding: '2px 8px' } : undefined}
      aria-label={`Risk level: ${level}`}
    >
      {RISK_LABELS[level]}
    </span>
  );
}
