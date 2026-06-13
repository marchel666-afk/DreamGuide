import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Dream, InterpretationType } from '../types';
import EmotionBadge from '../components/EmotionBadge';
import InterpretationCard from '../components/InterpretationCard';
import { BrainIcon, WaveIcon, PaletteIcon, ShareIcon, LockIcon } from '../components/Icons';

const TYPE_BTNS: { value: InterpretationType; label: string; Icon: React.FC<any>; grad: string }[] = [
  { value: 'psychological', label: 'Психол.',  Icon: BrainIcon,   grad: 'linear-gradient(135deg,#7C63F5,#B8A9FF)' },
  { value: 'everyday',      label: 'Житейск.', Icon: WaveIcon,    grad: 'linear-gradient(135deg,#4ABFC8,#8EC8C0)' },
  { value: 'creative',      label: 'Творч.',    Icon: PaletteIcon, grad: 'linear-gradient(135deg,#D47CB0,#E8A0C0)' },
];

const PAID_FEATURES = [
  { id: 'deep', label: 'Глубокий анализ', desc: '4 абзаца + практика проживания', price: 10, icon: '◈' },
  { id: 'nightmare', label: 'Протокол кошмара', desc: 'Как остановить повторяющийся сон', price: 15, icon: '◉' },
  { id: 'symbol', label: 'Личный символ', desc: 'Что этот образ значит именно для вас', price: 5, icon: '✦' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
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
    api.dreams.get(parseInt(id)).then(setDream).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, navigate]);

  async function addInterpretation(type: InterpretationType) {
    if (!dream || interpreting) return;
    setInterpreting(type);
    try {
      const interp = await api.dreams.interpret(dream.id, type);
      setDream((p) => p ? { ...p, interpretations: [...(p.interpretations ?? []), interp] } : p);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch (e: any) {
      window.Telegram?.WebApp?.showAlert(e.status === 402 ? 'Лимит исчерпан. Оплатите Stars в боте.' : 'Ошибка. Попробуйте позже.');
    } finally {
      setInterpreting(null);
    }
  }

  async function togglePublic() {
    if (!dream) return;
    const updated = await api.dreams.togglePublic(dream.id);
    setDream((p) => p ? { ...p, is_public: updated.is_public } : p);
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!dream) return null;

  const existingTypes = new Set(dream.interpretations?.map((i) => i.type) ?? []);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <EmotionBadge emotion={dream.emotion} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{formatDate(dream.created_at)}</p>
        </div>
        <button
          onClick={togglePublic}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 100,
            background: dream.is_public ? 'rgba(124,99,245,0.15)' : 'rgba(180,160,255,0.07)',
            border: `1px solid ${dream.is_public ? 'rgba(124,99,245,0.3)' : 'rgba(180,160,255,0.12)'}`,
            color: dream.is_public ? 'var(--violet-300)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <ShareIcon size={13} />
          {dream.is_public ? 'В галерее' : 'Поделиться'}
        </button>
      </div>

      {/* Dream text */}
      <div style={{
        padding: '20px',
        background: 'rgba(26,20,51,0.7)',
        borderLeft: '3px solid rgba(124,99,245,0.5)',
        borderRadius: '0 18px 18px 0',
        marginBottom: 28,
        backdropFilter: 'blur(8px)',
      }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(237,232,255,0.7)', fontStyle: 'italic' }}>
          {dream.text}
        </p>
      </div>

      {/* Interpretations */}
      {(dream.interpretations?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p className="section-title">Расшифровки</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dream.interpretations!.map((i) => <InterpretationCard key={i.id} interpretation={i} />)}
          </div>
        </div>
      )}

      {/* Add more free interpretations */}
      {existingTypes.size < 3 && (
        <div style={{ marginBottom: 28 }}>
          <p className="section-title">Добавить расшифровку</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {TYPE_BTNS.filter(({ value }) => !existingTypes.has(value)).map(({ value, label, Icon, grad }) => (
              <button
                key={value}
                onClick={() => addInterpretation(value)}
                disabled={!!interpreting}
                style={{
                  flexDirection: 'column', gap: 8,
                  padding: '16px 8px',
                  border: '1px solid rgba(180,160,255,0.12)',
                  borderRadius: 16,
                  background: 'rgba(35,27,69,0.5)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  opacity: interpreting && interpreting !== value ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: interpreting === value ? grad : 'rgba(180,160,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {interpreting === value
                    ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    : <Icon size={18} color={interpreting === value ? 'white' : 'rgba(180,160,255,0.5)'} />}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paid features */}
      <p className="section-title">Платные возможности</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PAID_FEATURES.map(({ id, label, desc, price, icon }) => (
          <div key={id} style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(35,27,69,0.6), rgba(45,35,85,0.4))',
            border: '1px solid rgba(245,216,122,0.12)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(145deg, rgba(245,216,122,0.15), rgba(232,160,192,0.1))',
              border: '1px solid rgba(245,216,122,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--gold-star)',
            }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
            </div>
            <div style={{
              padding: '6px 12px', borderRadius: 100, flexShrink: 0,
              background: 'rgba(124,99,245,0.15)',
              border: '1px solid rgba(124,99,245,0.25)',
              fontSize: 12, fontWeight: 700, color: 'var(--violet-300)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <LockIcon size={10} />
              {price} ★
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
