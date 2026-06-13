import { useNavigate } from 'react-router-dom';
import type { Dream } from '../types';
import EmotionBadge from './EmotionBadge';
import { ChevronRightIcon } from './Icons';

interface Props {
  dream: Dream;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function DreamCard({ dream }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="glass animate-fade-in"
      onClick={() => navigate(`/dream/${dream.id}`)}
      style={{
        padding: '16px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 18,
        }}
      >
        {dream.interpretations && dream.interpretations.length > 0 ? '✦' : '○'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <EmotionBadge emotion={dream.emotion} size="sm" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(dream.created_at)}</span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {dream.text}
        </p>
        {dream.interpretations && dream.interpretations.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
              {dream.interpretations.length} расшифровк{dream.interpretations.length === 1 ? 'а' : 'и'}
            </span>
          </div>
        )}
      </div>

      <ChevronRightIcon size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 12 }} />
    </div>
  );
}
