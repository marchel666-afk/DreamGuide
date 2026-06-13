import type { Interpretation } from '../types';
import { BrainIcon, WaveIcon, PaletteIcon } from './Icons';

const TYPES = {
  psychological: { label: 'Психологическое', Icon: BrainIcon,   grad: 'linear-gradient(135deg,#7C63F5,#B8A9FF)', glow: 'rgba(124,99,245,0.25)' },
  everyday:      { label: 'Житейское',        Icon: WaveIcon,    grad: 'linear-gradient(135deg,#4ABFC8,#8EC8C0)', glow: 'rgba(74,191,200,0.2)'  },
  creative:      { label: 'Творческое',        Icon: PaletteIcon, grad: 'linear-gradient(135deg,#D47CB0,#E8A0C0)', glow: 'rgba(212,124,176,0.25)' },
} as const;

export default function InterpretationCard({ interpretation }: { interpretation: Interpretation }) {
  const cfg = TYPES[interpretation.type as keyof typeof TYPES] ?? TYPES.psychological;
  const { Icon } = cfg;

  return (
    <div style={{
      background: 'rgba(26, 20, 51, 0.8)',
      border: '1px solid rgba(180,160,255,0.12)',
      borderRadius: 20,
      padding: '20px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${cfg.glow}`,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: cfg.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${cfg.glow}`,
          flexShrink: 0,
        }}>
          <Icon size={17} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
            {new Date(interpretation.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        {interpretation.is_premium && (
          <div style={{ marginLeft: 'auto' }} className="badge-premium">
            ✦ Premium
          </div>
        )}
      </div>

      {/* Content */}
      <p style={{
        fontSize: 14, lineHeight: 1.75,
        color: 'rgba(237,232,255,0.75)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {interpretation.content}
      </p>
    </div>
  );
}
