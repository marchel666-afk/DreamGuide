import type { Emotion } from '../types';

const EMOTIONS: Record<Emotion, { label: string; color: string; bg: string }> = {
  fear:     { label: 'Страх',     color: '#E8758A', bg: 'rgba(232,117,138,0.12)' },
  joy:      { label: 'Радость',   color: '#F5D87A', bg: 'rgba(245,216,122,0.1)' },
  sadness:  { label: 'Тоска',     color: '#8FA3C8', bg: 'rgba(143,163,200,0.12)' },
  surprise: { label: 'Удивление', color: '#8EC8C0', bg: 'rgba(142,200,192,0.12)' },
};

const DOTS: Record<Emotion, string> = {
  fear: '◆', joy: '◆', sadness: '◆', surprise: '◆',
};

interface Props { emotion: Emotion | string; size?: 'sm' | 'md'; }

export default function EmotionBadge({ emotion, size = 'md' }: Props) {
  const cfg = EMOTIONS[emotion as Emotion] ?? { label: emotion, color: 'rgba(237,232,255,0.5)', bg: 'rgba(237,232,255,0.05)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '4px 10px' : '5px 12px',
      borderRadius: 100,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 500,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}35`,
      letterSpacing: '0.02em',
    }}>
      <span style={{ fontSize: size === 'sm' ? 6 : 7, lineHeight: 1 }}>◆</span>
      {cfg.label}
    </span>
  );
}
