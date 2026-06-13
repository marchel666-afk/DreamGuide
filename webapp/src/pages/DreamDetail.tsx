import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Dream, InterpretationType } from '../types';
import EmotionBadge from '../components/EmotionBadge';
import InterpretationCard from '../components/InterpretationCard';
import { BrainIcon, WaveIcon, PaletteIcon, ShareIcon } from '../components/Icons';

const TYPES: { value: InterpretationType; label: string; Icon: React.FC<any>; color: string }[] = [
  { value: 'psychological', label: 'Психол.', Icon: BrainIcon,   color: '#B388FF' },
  { value: 'everyday',      label: 'Житейск.', Icon: WaveIcon,    color: '#00D4FF' },
  { value: 'creative',      label: 'Творч.',    Icon: PaletteIcon, color: '#FF6B9D' },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [interpreting, setInterpreting] = useState<InterpretationType | null>(null);

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show();
    window.Telegram?.WebApp?.BackButton?.onClick(() => navigate(-1));
    return () => window.Telegram?.WebApp?.BackButton?.hide();
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    api.dreams.get(parseInt(id))
      .then(setDream)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function addInterpretation(type: InterpretationType) {
    if (!dream || interpreting) return;
    const alreadyHas = dream.interpretations?.some((i) => i.type === type);
    if (alreadyHas) return;
    setInterpreting(type);
    try {
      const interp = await api.dreams.interpret(dream.id, type);
      setDream((prev) => prev ? { ...prev, interpretations: [...(prev.interpretations || []), interp] } : prev);
    } catch (e: any) {
      window.Telegram?.WebApp?.showAlert(
        e.status === 402 ? 'Лимит исчерпан. Оплатите Stars в боте.' : 'Ошибка. Попробуйте позже.'
      );
    } finally {
      setInterpreting(null);
    }
  }

  async function togglePublic() {
    if (!dream) return;
    const updated = await api.dreams.togglePublic(dream.id);
    setDream((prev) => prev ? { ...prev, is_public: updated.is_public } : prev);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!dream) return null;

  const existingTypes = new Set(dream.interpretations?.map((i) => i.type));

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <EmotionBadge emotion={dream.emotion} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {formatDate(dream.created_at)}
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={togglePublic}
          style={{ gap: 6, padding: '8px 12px', fontSize: 12 }}
        >
          <ShareIcon size={14} />
          {dream.is_public ? 'В галерее' : 'Поделиться'}
        </button>
      </div>

      {/* Dream text */}
      <div
        className="glass"
        style={{
          padding: '18px',
          marginBottom: 24,
          borderLeft: '3px solid var(--accent-primary)',
          borderRadius: '0 16px 16px 0',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {dream.text}
        </p>
      </div>

      {/* Existing interpretations */}
      {dream.interpretations && dream.interpretations.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p className="section-title">Расшифровки</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dream.interpretations.map((interp) => (
              <InterpretationCard key={interp.id} interpretation={interp} />
            ))}
          </div>
        </div>
      )}

      {/* Add more interpretations */}
      {existingTypes.size < 3 && (
        <div>
          <p className="section-title">Добавить расшифровку</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {TYPES.filter(({ value }) => !existingTypes.has(value)).map(({ value, label, Icon, color }) => (
              <button
                key={value}
                className="btn"
                onClick={() => addInterpretation(value)}
                disabled={interpreting === value}
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 6,
                  padding: '14px 8px',
                  background: 'var(--bg-card)',
                  border: `1px solid ${color}30`,
                  borderRadius: 12,
                  color: color,
                  fontSize: 12,
                  opacity: interpreting && interpreting !== value ? 0.5 : 1,
                }}
              >
                {interpreting === value ? (
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                ) : (
                  <Icon size={20} color={color} />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
