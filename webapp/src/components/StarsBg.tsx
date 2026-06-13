import { useMemo } from 'react';

export default function CosmicBg() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.15 ? Math.random() * 2 + 2 : Math.random() * 1.5 + 0.5,
    dur: Math.random() * 5 + 2,
    delay: Math.random() * 6,
    op: Math.random() * 0.5 + 0.15,
  })), []);

  return (
    <>
      {/* Main cosmic background */}
      <div className="cosmic-bg" />

      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.size > 2
                ? 'radial-gradient(circle, #EDE8FF, #C5B8FF)'
                : 'white',
              animation: `twinkle ${s.dur}s ${s.delay}s infinite ease-in-out`,
              '--op': s.op,
            } as React.CSSProperties}
          />
        ))}

        {/* Large distant planet bottom-left */}
        <div style={{
          position: 'absolute',
          bottom: -120,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #3D2878, #1A1033 60%, #0B0818)',
          boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(98,71,217,0.2)',
          opacity: 0.6,
        }} />

        {/* Small moon top-right */}
        <div style={{
          position: 'absolute',
          top: 60,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #6B5BA0, #2D1B69 60%, #1A1033)',
          boxShadow: 'inset -8px -8px 30px rgba(0,0,0,0.4), 0 0 40px rgba(124,99,245,0.15)',
          opacity: 0.5,
        }} />
      </div>
    </>
  );
}
