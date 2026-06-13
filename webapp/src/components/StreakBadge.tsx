import { FlameIcon } from './Icons';

interface Props {
  days: number;
}

export default function StreakBadge({ days }: Props) {
  const color = days >= 30 ? '#FFD93D' : days >= 7 ? '#FF8C42' : days >= 3 ? '#FF6B6B' : 'var(--text-muted)';

  return (
    <div
      className="glass"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 12,
        border: days > 0 ? `1px solid ${color}30` : '1px solid var(--border)',
      }}
    >
      <FlameIcon size={16} color={color} />
      <span style={{ fontSize: 14, fontWeight: 600, color }}>
        {days}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {days === 1 ? 'день' : days >= 2 && days <= 4 ? 'дня' : 'дней'}
      </span>
    </div>
  );
}
