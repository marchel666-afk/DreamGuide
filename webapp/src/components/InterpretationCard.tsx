import type { Interpretation } from '../types';
import { BrainIcon, WaveIcon, PaletteIcon } from './Icons';

const TYPE_CONFIG = {
  psychological: { label: 'Психологическое', Icon: BrainIcon, color: '#B388FF' },
  everyday:      { label: 'Житейское',        Icon: WaveIcon,  color: '#00D4FF' },
  creative:      { label: 'Творческое',        Icon: PaletteIcon, color: '#FF6B9D' },
};

interface Props {
  interpretation: Interpretation;
}

export default function InterpretationCard({ interpretation }: Props) {
  const cfg = TYPE_CONFIG[interpretation.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.psychological;
  const { Icon } = cfg;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${cfg.color}25`,
        borderRadius: 16,
        padding: 18,
        boxShadow: `0 0 20px ${cfg.color}12`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={cfg.color} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
        {interpretation.is_premium && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 600,
              color: '#FFD93D',
              background: 'rgba(255,217,61,0.1)',
              border: '1px solid rgba(255,217,61,0.2)',
              padding: '2px 7px',
              borderRadius: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Premium
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {interpretation.content}
      </p>
    </div>
  );
}
