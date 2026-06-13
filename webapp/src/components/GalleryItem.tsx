import type { GalleryDream } from '../types';
import EmotionBadge from './EmotionBadge';

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (diff < 1) return 'только что';
  if (diff < 24) return `${diff}ч назад`;
  const days = Math.floor(diff / 24);
  return `${days}д назад`;
}

export default function GalleryItem({ item }: { item: GalleryDream }) {
  return (
    <div style={{
      background: 'rgba(26,20,51,0.7)',
      border: '1px solid rgba(180,160,255,0.1)',
      borderRadius: 20,
      padding: '18px',
      marginBottom: 12,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(145deg, #7C63F5, #4A34B0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {item.author_initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <EmotionBadge emotion={item.emotion} size="sm" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Dream text */}
      <p style={{
        fontSize: 13, lineHeight: 1.6,
        color: 'rgba(237,232,255,0.55)',
        fontStyle: 'italic',
        marginBottom: item.interpretation_preview ? 12 : 0,
      }}>
        «{item.text}»
      </p>

      {/* Interpretation preview */}
      {item.interpretation_preview && (
        <div style={{
          marginTop: 12,
          padding: '12px 14px',
          background: 'rgba(124,99,245,0.08)',
          border: '1px solid rgba(124,99,245,0.15)',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--violet-400)', marginBottom: 5, textTransform: 'uppercase' }}>
            Расшифровка
          </div>
          <p style={{ fontSize: 12, color: 'rgba(237,232,255,0.6)', lineHeight: 1.6 }}>
            {item.interpretation_preview}
          </p>
        </div>
      )}
    </div>
  );
}
