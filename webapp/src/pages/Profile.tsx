import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Stats } from '../types';
import StreakBadge from '../components/StreakBadge';
import { StarIcon, UserIcon, FlameIcon } from '../components/Icons';

const BADGES = [
  { id: 'streak3',  label: 'Ранний пророк', desc: '3 дня подряд',  minStreak: 3,  color: '#FF6B6B' },
  { id: 'streak7',  label: 'Толкователь',   desc: '7 дней подряд', minStreak: 7,  color: '#FF8C42' },
  { id: 'streak30', label: 'Лунатик',        desc: '30 дней',       minStreak: 30, color: '#FFD93D' },
];

export default function Profile() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  useEffect(() => {
    api.stats.get().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const initials = tgUser
    ? (tgUser.first_name?.[0] ?? '') + (tgUser.last_name?.[0] ?? '')
    : '??';

  const streakDays = stats?.streak_days ?? 0;

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Профиль</h1>

      {/* Avatar card */}
      <div
        className="glass-accent"
        style={{ padding: '24px 20px', marginBottom: 20, textAlign: 'center' }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            margin: '0 auto 14px',
            boxShadow: 'var(--glow-primary)',
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {initials.toUpperCase() || <UserIcon size={32} color="white" />}
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>
          {tgUser ? tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '') : 'Пользователь'}
        </h2>
        {tgUser?.username && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{tgUser.username}</p>
        )}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <StreakBadge days={streakDays} />
          <div
            className="glass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12 }}
          >
            <StarIcon size={15} color="#FFD93D" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFD93D' }}>
              {stats?.total_stars ?? 0}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stars</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-title">Достижения</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BADGES.map(({ id, label, desc, minStreak, color }) => {
            const earned = streakDays >= minStreak;
            return (
              <div
                key={id}
                className="glass"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  opacity: earned ? 1 : 0.4,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: earned ? `${color}20` : 'var(--bg-tertiary)',
                    border: `1px solid ${earned ? color : 'var(--border)'}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FlameIcon size={20} color={earned ? color : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                </div>
                {earned && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      fontWeight: 600,
                      color,
                      background: `${color}15`,
                      padding: '3px 8px',
                      borderRadius: 8,
                    }}
                  >
                    Получено
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium hint */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(179,136,255,0.1))',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 16,
          padding: '18px',
          textAlign: 'center',
        }}
      >
        <StarIcon size={24} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>Премиум подписка</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
          10 глубоких толкований сразу, неограниченный стрейк и розовая тема всего за 49 звезд в месяц.
        </p>
        <div style={{ fontSize: 13, color: 'var(--accent-secondary)', fontWeight: 600 }}>
          Оплата через бот — 49 Stars (~0.70$)
        </div>
      </div>
    </div>
  );
}
