import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Emotion, InterpretationType } from '../types';
import { BrainIcon, WaveIcon, PaletteIcon } from '../components/Icons';

const EMOTIONS: { value: Emotion; label: string; desc: string; color: string; icon: string }[] = [
  { value: 'fear',     label: 'Страх',     desc: 'Тревога, угроза',    color: '#E8758A', icon: '◐' },
  { value: 'joy',      label: 'Радость',   desc: 'Лёгкость, счастье',  color: '#F5D87A', icon: '☀' },
  { value: 'sadness',  label: 'Тоска',     desc: 'Печаль, ностальгия', color: '#8FA3C8', icon: '◑' },
  { value: 'surprise', label: 'Удивление', desc: 'Восторг, открытие',  color: '#8EC8C0', icon: '✦' },
];

const TYPES: { value: InterpretationType; label: string; desc: string; Icon: React.FC<any>; grad: string; price?: number }[] = [
  { value: 'psychological', label: 'Психологическое', desc: 'Юнг, архетипы, подсознание',    Icon: BrainIcon,   grad: 'linear-gradient(135deg,#7C63F5,#B8A9FF)' },
  { value: 'everyday',      label: 'Житейское',       desc: 'Связь с реальными событиями',    Icon: WaveIcon,    grad: 'linear-gradient(135deg,#4ABFC8,#8EC8C0)' },
  { value: 'creative',      label: 'Творческое',      desc: 'Образы для вдохновения и идей',  Icon: PaletteIcon, grad: 'linear-gradient(135deg,#D47CB0,#E8A0C0)' },
];

export default function NewDream() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [type, setType] = useState<InterpretationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1|2|3>(1);

  async function handleSubmit() {
    if (!text.trim() || !emotion || !type) return;
    setLoading(true); setError('');
    try {
      const dream = await api.dreams.create({ text: text.trim(), emotion });
      await api.dreams.interpret(dream.id, type);
      navigate(`/dream/${dream.id}`);
    } catch (e: any) {
      setError(e.status === 402
        ? 'Дневной лимит исчерпан. Продолжи в боте или купи Stars.'
        : 'Произошла ошибка. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {[1,2,3].map((s) => (
          <div key={s} style={{
            flex: s === step ? 2 : 1,
            height: 4, borderRadius: 2,
            background: s <= step ? 'linear-gradient(90deg,#7C63F5,#B8A9FF)' : 'rgba(180,160,255,0.12)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Step 1 — Text */}
      {step === 1 && (
        <div className="animate-fade-up">
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Опишите сон</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            Чем больше деталей — тем глубже расшифровка
          </p>
          <textarea
            className="input"
            rows={7}
            placeholder="Мне снилось, что я шёл по тёмному лесу и вдруг увидел свет..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>Минимум 10 символов</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{text.length}/2000</span>
          </div>
          <button
            className="btn btn-primary btn-full"
            disabled={text.trim().length < 10}
            onClick={() => setStep(2)}
            style={{ opacity: text.trim().length >= 10 ? 1 : 0.4 }}
          >
            Далее
          </button>
        </div>
      )}

      {/* Step 2 — Emotion */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Эмоция пробуждения</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>
            С каким чувством вы проснулись?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {EMOTIONS.map(({ value, label, desc, color, icon }) => (
              <button
                key={value}
                onClick={() => setEmotion(value)}
                style={{
                  padding: '20px 14px',
                  border: `1px solid ${emotion === value ? color : 'rgba(180,160,255,0.1)'}`,
                  borderRadius: 20,
                  background: emotion === value ? `${color}12` : 'rgba(35,27,69,0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: emotion === value ? `0 0 20px ${color}25` : 'none',
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 8, color }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: emotion === value ? color : 'var(--text-primary)', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>Назад</button>
            <button
              className="btn btn-primary"
              disabled={!emotion}
              onClick={() => setStep(3)}
              style={{ flex: 2, opacity: emotion ? 1 : 0.4 }}
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Type */}
      {step === 3 && (
        <div className="animate-fade-up">
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Тип расшифровки</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>
            Как вы хотите понять этот сон?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {TYPES.map(({ value, label, desc, Icon, grad }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                style={{
                  padding: '16px 18px',
                  border: `1px solid ${type === value ? 'rgba(180,160,255,0.3)' : 'rgba(180,160,255,0.1)'}`,
                  borderRadius: 18,
                  background: type === value ? 'rgba(124,99,245,0.12)' : 'rgba(35,27,69,0.5)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s',
                  boxShadow: type === value ? '0 0 20px rgba(124,99,245,0.2)' : 'none',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: type === value ? grad : 'rgba(180,160,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={20} color={type === value ? 'white' : 'rgba(180,160,255,0.4)'} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: type === value ? 'var(--moonlight)' : 'var(--text-primary)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                </div>
                {type === value && (
                  <div style={{ marginLeft: 'auto', color: 'var(--violet-300)', fontSize: 18 }}>✓</div>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 14,
              background: 'rgba(232,117,138,0.1)',
              border: '1px solid rgba(232,117,138,0.25)',
              color: '#E8758A', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>Назад</button>
            <button
              className="btn btn-primary"
              disabled={!type || loading}
              onClick={handleSubmit}
              style={{ flex: 2, opacity: type && !loading ? 1 : 0.4 }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Анализируем...</>
                : 'Расшифровать'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-hint)', marginTop: 12 }}>
            3 бесплатных расшифровки в день
          </p>
        </div>
      )}
    </div>
  );
}
