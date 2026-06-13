import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Stats } from '../types';
import DreamCard from '../components/DreamCard';
import StreakBadge from '../components/StreakBadge';
import { MoonIcon, StarIcon, PlusIcon } from '../components/Icons';

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  useEffect(() => {
    api.stats.get().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const freeLeft = 3 - (stats?.recent_dreams?.length ? 0 : 0);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-primary)',
            }}
          >
            <MoonIcon size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>DreamGuide</h1>
            {tgUser && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                {tgUser.first_name}
              </p>
            )}
          </div>
        </div>
        {stats && <StreakBadge days={stats.streak_days} />}
      </div>

      {/* CTA card */}
      <div
        className="glass-accent"
        style={{ padding: '22px 20px', marginBottom: 24, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => navigate('/new')}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: 'var(--glow-primary)',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <PlusIcon size={24} color="white" />
        </div>
        <h2 style={{ fontSize: 17, marginBottom: 6 }}>Записать сон</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Сны — это письма самого себя.<br />Вскрой их прямо сейчас.
        </p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Всего снов', value: stats.total_dreams },
            { label: 'Серия дней', value: stats.streak_days },
            { label: 'Звезды', value: stats.total_stars },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="glass"
              style={{ padding: '14px 10px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'var(--accent-secondary)' }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.03em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent dreams */}
      <div style={{ marginBottom: 12 }}>
        <p className="section-title">Последние сны</p>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}
        {!loading && stats?.recent_dreams?.length === 0 && (
          <div
            className="glass"
            style={{ padding: '32px 20px', textAlign: 'center' }}
          >
            <MoonIcon size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Ещё нет записанных снов.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
              Запишите первый сон — и начните познавать себя.
            </p>
          </div>
        )}
        {stats?.recent_dreams?.map((dream) => (
          <DreamCard key={dream.id} dream={dream} />
        ))}
      </div>
    </div>
  );
}
