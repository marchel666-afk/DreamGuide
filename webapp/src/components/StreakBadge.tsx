interface Props { days: number; }

export default function StreakBadge({ days }: Props) {
  const tier = days >= 30 ? 'gold' : days >= 7 ? 'silver' : days >= 3 ? 'bronze' : 'none';
  const colors = {
    gold:   { ring: '#F5D87A', glow: 'rgba(245,216,122,0.4)', bg: 'rgba(245,216,122,0.1)', label: '#F5D87A' },
    silver: { ring: '#C5B8FF', glow: 'rgba(197,184,255,0.35)', bg: 'rgba(197,184,255,0.08)', label: '#C5B8FF' },
    bronze: { ring: '#E8A0C0', glow: 'rgba(232,160,192,0.3)', bg: 'rgba(232,160,192,0.08)', label: '#E8A0C0' },
    none:   { ring: 'rgba(180,160,255,0.2)', glow: 'none', bg: 'rgba(180,160,255,0.05)', label: 'var(--text-muted)' },
  }[tier];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 100,
      background: colors.bg,
      border: `1px solid ${colors.ring}40`,
      boxShadow: tier !== 'none' ? `0 0 16px ${colors.glow}` : 'none',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5C5.5 3.5 3 4 3 6.5C3 8.4 4.8 10 7 10C9.2 10 11 8.4 11 6.5C11 4 8.5 3.5 7 1.5Z"
          fill={colors.ring} opacity="0.9"/>
        <circle cx="7" cy="7" r="2" fill={colors.ring}/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 700, color: colors.label, fontFamily: 'Playfair Display, serif' }}>
        {days}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {days === 1 ? 'день' : days >= 2 && days <= 4 ? 'дня' : 'дней'}
      </span>
    </div>
  );
}
