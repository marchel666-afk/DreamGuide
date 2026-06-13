import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Stats, CalendarData } from '../types';

const EMOTIONS: Record<string, { label: string; color: string }> = {
  fear:     { label: 'Страх',     color: '#E8758A' },
  joy:      { label: 'Радость',   color: '#F5D87A' },
  sadness:  { label: 'Тоска',     color: '#8FA3C8' },
  surprise: { label: 'Удивление', color: '#8EC8C0' },
};

function Calendar({ data }: { data: CalendarData }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthName = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '18px', background: 'rgba(35,27,69,0.5)', border: '1px solid rgba(180,160,255,0.08)', borderRadius: 20 }}>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'capitalize', fontFamily: 'Playfair Display,serif' }}>
        {monthName}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-hint)', paddingBottom: 6, letterSpacing: '0.04em' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const count = data[key] ?? 0;
          const isToday = day === now.getDate();
          return (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
              background: count > 0
                ? `rgba(124,99,245,${Math.min(0.15 + count * 0.2, 0.65)})`
                : 'transparent',
              border: isToday ? '1px solid rgba(124,99,245,0.5)' : '1px solid transparent',
              color: count > 0 ? 'var(--violet-300)' : isToday ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: isToday ? 700 : 400,
            }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  const total = Object.values(stats?.emotions ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Статистика</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Ваш сонный журнал</p>

      {/* Big numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { val: stats?.total_dreams ?? 0, label: 'Снов записано', color: '#B8A9FF', sub: 'за всё время' },
          { val: `${stats?.streak_days ?? 0}д`, label: 'Серия', color: '#F5D87A', sub: 'подряд' },
        ].map(({ val, label, color, sub }) => (
          <div key={label} style={{
            padding: '20px 16px',
            background: 'rgba(35,27,69,0.5)',
            border: '1px solid rgba(180,160,255,0.08)',
            borderRadius: 20,
          }}>
            <div style={{ fontSize: 34, fontFamily: 'Playfair Display,serif', fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <p className="section-title" style={{ marginBottom: 12 }}>Активность</p>
      <div style={{ marginBottom: 20 }}>
        <Calendar data={calendar} />
      </div>

      {/* Emotions */}
      {total > 0 && (
        <>
          <p className="section-title">Эмоциональный профиль</p>
          <div style={{
            padding: '18px',
            background: 'rgba(35,27,69,0.5)',
            border: '1px solid rgba(180,160,255,0.08)',
            borderRadius: 20,
            marginBottom: 20,
          }}>
            {Object.entries(stats?.emotions ?? {}).sort((a,b) => b[1]-a[1]).map(([emo, cnt]) => {
              const cfg = EMOTIONS[emo] ?? { label: emo, color: 'var(--text-muted)' };
              const pct = Math.round((cnt / total) * 100);
              return (
                <div key={emo} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(180,160,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3,
                      background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)`,
                      transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Paid: PDF export promo */}
      <div style={{
        padding: '18px',
        background: 'linear-gradient(135deg, rgba(245,216,122,0.07), rgba(232,160,192,0.05))',
        border: '1px solid rgba(245,216,122,0.15)',
        borderRadius: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>◈</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>PDF-дневник за месяц</span>
          <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 100, background: 'rgba(124,99,245,0.15)', border: '1px solid rgba(124,99,245,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--violet-300)' }}>25 ★</div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Красивая книга ваших снов с инсайтами и расшифровками — сохраните или распечатайте.
        </p>
      </div>
    </div>
  );
}
