import type { GalleryDream } from '../types';
import EmotionBadge from './EmotionBadge';

interface Props {
  item: GalleryDream;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function GalleryItem({ item }: Props) {
  return (
    <div
      className="glass"
      style={{ padding: '16px', marginBottom: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {item.author_initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <EmotionBadge emotion={item.emotion} size="sm" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</span>
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: item.interpretation_preview ? 12 : 0,
          fontStyle: 'italic',
        }}
      >
        "{item.text}"
      </p>

      {item.interpretation_preview && (
        <div
          style={{
            borderLeft: '2px solid var(--accent-primary)',
            paddingLeft: 10,
            marginTop: 10,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {item.interpretation_preview}
          </p>
        </div>
      )}
    </div>
  );
}
