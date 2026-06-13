import { useNavigate } from 'react-router-dom';
import type { Dream } from '../types';
import EmotionBadge from './EmotionBadge';

const EMOTION_ICONS: Record<string, string> = {
  fear: '◐', joy: '☀', sadness: '◑', surprise: '✦',
};

function formatDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'вчера';
  if (diff < 7) return `${diff} дня назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function DreamCard({ dream }: { dream: Dream }) {
  const navigate = useNavigate();
  const hasInterp = (dream.interpretations?.length ?? 0) > 0;

  return (
    <div
      onClick={() => navigate(`/dream/${dream.id}`)}
      style={{
        display: 'flex', gap: 14, padding: '16px',
        background: 'rgba(35, 27, 69, 0.5)',
        border: '1px solid rgba(180,160,255,0.1)',
        borderRadius: 20,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
      }}
      className="animate-fade-up"
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, flexShrink: 0,
        borderRadius: 14,
        background: hasInterp
          ? 'linear-gradient(145deg, rgba(124,99,245,0.3), rgba(98,71,217,0.2))'
          : 'rgba(180,160,255,0.07)',
        border: `1px solid ${hasInterp ? 'rgba(124,99,245,0.4)' : 'rgba(180,160,255,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        color: hasInterp ? '#B8A9FF' : 'rgba(237,232,255,0.3)',
      }}>
        {EMOTION_ICONS[dream.emotion] ?? '◐'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <EmotionBadge emotion={dream.emotion} size="sm" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
            {formatDate(dream.created_at)}
          </span>
        </div>
        <p style={{
          fontSize: 13, lineHeight: 1.55,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {dream.text}
        </p>
        {hasInterp && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {dream.interpretations!.map((i) => (
              <span key={i.id} style={{
                fontSize: 10, fontWeight: 500,
                color: 'rgba(180,160,255,0.6)',
                background: 'rgba(124,99,245,0.1)',
                padding: '2px 7px', borderRadius: 8,
              }}>
                {i.type === 'psychological' ? 'Психол.' : i.type === 'everyday' ? 'Житейск.' : 'Творч.'}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(180,160,255,0.25)', fontSize: 16 }}>›</div>
    </div>
  );
}
