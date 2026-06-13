import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Emotion, InterpretationType } from '../types';
import { BrainIcon, WaveIcon, PaletteIcon } from '../components/Icons';

const EMOTIONS: { value: Emotion; label: string; color: string }[] = [
  { value: 'fear',     label: 'Страх',     color: '#FF6B6B' },
  { value: 'joy',      label: 'Радость',   color: '#FFD93D' },
  { value: 'sadness',  label: 'Тоска',     color: '#6BA3FF' },
  { value: 'surprise', label: 'Удивление', color: '#A8FF6B' },
];

const TYPES: { value: InterpretationType; label: string; desc: string; Icon: React.FC<any>; color: string }[] = [
  { value: 'psychological', label: 'Психологическое', desc: 'Юнг, Фрейд, архетипы',  Icon: BrainIcon,   color: '#B388FF' },
  { value: 'everyday',      label: 'Житейское',       desc: 'Связь с реальной жизнью', Icon: WaveIcon,    color: '#00D4FF' },
  { value: 'creative',      label: 'Творческое',      desc: 'Образы для вдохновения',  Icon: PaletteIcon, color: '#FF6B9D' },
];

export default function NewDream() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [type, setType] = useState<InterpretationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim() || !emotion || !type) return;
    setLoading(true);
    setError('');
    try {
      const dream = await api.dreams.create({ text: text.trim(), emotion });
      const interp = await api.dreams.interpret(dream.id, type);
      navigate(`/dream/${dream.id}`);
    } catch (e: any) {
      if (e.status === 402) {
        setError('Дневной лимит бесплатных расшифровок исчерпан. Продолжи в боте.');
      } else {
        setError('Произошла ошибка. Попробуй ещё раз.');
      }
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = text.trim().length > 10 && emotion !== null && type !== null;

  return (
    <div className="page">
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Новый сон</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Опишите сон — чем детальнее, тем точнее расшифровка.
      </p>

      {/* Text input */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-title">Описание сна</p>
        <textarea
          className="input"
          rows={5}
          placeholder="Мне снилось, что я шёл по лесу и вдруг увидел..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          {text.length} / 2000
        </div>
      </div>

      {/* Emotion */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-title">С каким чувством проснулись?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EMOTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              className="btn"
              onClick={() => setEmotion(value)}
              style={{
                background: emotion === value ? `${color}20` : 'var(--bg-card)',
                border: `1px solid ${emotion === value ? color : 'var(--border)'}`,
                color: emotion === value ? color : 'var(--text-secondary)',
                borderRadius: 12,
                padding: '12px 10px',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.18s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Interpretation type */}
      <div style={{ marginBottom: 28 }}>
        <p className="section-title">Тип расшифровки</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TYPES.map(({ value, label, desc, Icon, color }) => (
            <button
              key={value}
              className="btn"
              onClick={() => setType(value)}
              style={{
                background: type === value ? `${color}12` : 'var(--bg-card)',
                border: `1px solid ${type === value ? color : 'var(--border)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                transition: 'all 0.18s',
                boxShadow: type === value ? `0 0 16px ${color}20` : 'none',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: type === value ? color : 'var(--text-primary)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#FF6B6B',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-full"
        disabled={!canSubmit || loading}
        onClick={handleSubmit}
        style={{ opacity: canSubmit && !loading ? 1 : 0.5, fontSize: 15, padding: '15px' }}
      >
        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Анализируем...</> : 'Расшифровать сон'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
        3 бесплатных расшифровки в день
      </p>
    </div>
  );
}
