import type { Emotion } from '../types';

const EMOTIONS: Record<Emotion, { label: string; color: string; bg: string }> = {
  fear:     { label: 'Страх',      color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  joy:      { label: 'Радость',    color: '#FFD93D', bg: 'rgba(255,217,61,0.12)' },
  sadness:  { label: 'Тоска',      color: '#6BA3FF', bg: 'rgba(107,163,255,0.12)' },
  surprise: { label: 'Удивление',  color: '#A8FF6B', bg: 'rgba(168,255,107,0.12)' },
};

interface Props {
  emotion: Emotion | string;
  size?: 'sm' | 'md';
}

export default function EmotionBadge({ emotion, size = 'md' }: Props) {
  const cfg = EMOTIONS[emotion as Emotion] ?? { label: emotion, color: 'var(--text-muted)', bg: 'var(--bg-card)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        borderRadius: 20,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 500,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </span>
  );
}
