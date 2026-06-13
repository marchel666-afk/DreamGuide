import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Stats, CalendarData } from '../types';
import { CalendarIcon } from '../components/Icons';

const EMOTION_LABELS: Record<string, { label: string; color: string }> = {
  fear:     { label: 'Страх',     color: '#FF6B6B' },
  joy:      { label: 'Радость',   color: '#FFD93D' },
  sadness:  { label: 'Тоска',     color: '#6BA3FF' },
  surprise: { label: 'Удивление', color: '#A8FF6B' },
};

function MiniCalendar({ data }: { data: CalendarData }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = (firstDay + 6) % 7; // Mon-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(adjustedFirst).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div className="glass" style={{ padding: '16px' }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12, textAlign: 'center', textTransform: 'capitalize' }}>
        {monthName}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = data[key] || 0;
          const isToday = day === today.getDate();
          return (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: isToday ? 700 : 400,
                background: count > 0 ? `rgba(108,99,255,${Math.min(0.2 + count * 0.15, 0.7)})` : 'transparent',
                border: isToday ? '1px solid var(--accent-primary)' : '1px solid transparent',
                color: count > 0 ? 'var(--accent-secondary)' : isToday ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [calendar, setCalendar] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats.get(), api.stats.calendar()])
      .then(([s, c]) => { setStats(s); setCalendar(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const totalEmotions = Object.values(stats?.emotions || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <CalendarIcon size={20} color="var(--accent-primary)" />
        <h1 style={{ fontSize: 22 }}>Статистика</h1>
      </div>

      {/* Key numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Всего снов', value: stats?.total_dreams ?? 0, color: 'var(--accent-primary)' },
          { label: 'Серия', value: `${stats?.streak_days ?? 0} дн.`, color: '#FF8C42' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: '18px 14px' }}>
            <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-title">Календарь снов</p>
        <MiniCalendar data={calendar} />
      </div>

      {/* Emotion distribution */}
      {stats && totalEmotions > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="section-title">Эмоции</p>
          <div className="glass" style={{ padding: '16px' }}>
            {Object.entries(stats.emotions)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, count]) => {
                const cfg = EMOTION_LABELS[emotion] ?? { label: emotion, color: 'var(--text-muted)' };
                const pct = Math.round((count / totalEmotions) * 100);
                return (
                  <div key={emotion} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: cfg.color,
                          borderRadius: 3,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {stats && totalEmotions === 0 && (
        <div className="glass" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Запишите первый сон, чтобы увидеть статистику эмоций.
          </p>
        </div>
      )}
    </div>
  );
}
