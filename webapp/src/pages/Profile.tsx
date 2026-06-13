import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Stats } from '../types';
import StreakBadge from '../components/StreakBadge';

const BADGES = [
  { id: 'streak3',  label: 'Ранний пророк', desc: '3 дня подряд',  icon: '◆', minStreak: 3,  color: '#E8A0C0' },
  { id: 'streak7',  label: 'Толкователь',   desc: '7 дней подряд', icon: '◈', minStreak: 7,  color: '#B8A9FF' },
  { id: 'streak30', label: 'Лунатик',        desc: '30 дней',       icon: '☽', minStreak: 30, color: '#F5D87A' },
  { id: 'dreams10', label: 'Хронист',        desc: '10 снов',       icon: '◉', minDreams: 10, color: '#8EC8C0' },
];

const PAID_PLANS = [
  {
    id: 'deep',
    label: 'Глубокое толкование',
    features: ['4 абзаца анализа', 'Связь с реальными событиями', 'Практика проживания сна'],
    price: 10, unit: 'за расшифровку',
    grad: 'linear-gradient(135deg, rgba(124,99,245,0.25), rgba(98,71,217,0.15))',
    border: 'rgba(124,99,245,0.25)',
  },
  {
    id: 'premium',
    label: 'Премиум подписка',
    features: ['10 глубоких толкований', 'Неограниченный стрейк', 'Эксклюзивная тема'],
    price: 49, unit: 'в месяц',
    grad: 'linear-gradient(135deg, rgba(245,216,122,0.15), rgba(232,160,192,0.1))',
    border: 'rgba(245,216,122,0.25)',
    highlight: true,
  },
];

export default function Profile() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  useEffect(() => {
    api.stats.get().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const initials = tgUser
    ? (((tgUser.first_name?.[0] ?? '') + (tgUser.last_name?.[0] ?? '')).toUpperCase() || (tgUser.first_name?.[0]?.toUpperCase() ?? '?'))
    : '?';

  const streak = stats?.streak_days ?? 0;
  const totalDreams = stats?.total_dreams ?? 0;

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* Avatar section */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {/* Avatar */}
        <div style={{
          width: 84, height: 84, borderRadius: '50%', margin: '0 auto 14px',
          background: 'linear-gradient(145deg, #7C63F5, #4A34B0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: 'white',
          fontFamily: 'Playfair Display,serif',
          boxShadow: '0 0 0 3px rgba(124,99,245,0.2), 0 0 0 6px rgba(124,99,245,0.08), var(--glow-violet)',
        }}>
          {initials}
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 3 }}>
          {tgUser ? tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '') : 'Пользователь'}
        </h2>
        {tgUser?.username && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>@{tgUser.username}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StreakBadge days={streak} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 100,
            background: 'rgba(245,216,122,0.1)',
            border: '1px solid rgba(245,216,122,0.2)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F5D87A' }}>★</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F5D87A' }}>{stats?.total_stars ?? 0}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stars</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <p className="section-title">Достижения</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {BADGES.map(({ id, label, desc, icon, minStreak, minDreams, color }) => {
          const earned = (minStreak ? streak >= minStreak : false) || (minDreams ? totalDreams >= minDreams : false);
          return (
            <div key={id} style={{
              padding: '16px',
              background: earned ? `${color}0A` : 'rgba(35,27,69,0.4)',
              border: `1px solid ${earned ? color + '30' : 'rgba(180,160,255,0.07)'}`,
              borderRadius: 18,
              opacity: earned ? 1 : 0.45,
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: earned ? color : 'rgba(180,160,255,0.3)' }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
              {earned && (
                <div style={{
                  display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 600,
                  color, background: `${color}15`, padding: '2px 7px', borderRadius: 6,
                }}>
                  Получено
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paid plans */}
      <p className="section-title">Тарифы</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {PAID_PLANS.map(({ id, label, features, price, unit, grad, border, highlight }) => (
          <div key={id} style={{
            padding: '20px',
            background: grad,
            border: `1px solid ${border}`,
            borderRadius: 20,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {highlight && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                padding: '3px 10px', borderRadius: 100,
                background: 'rgba(245,216,122,0.2)',
                border: '1px solid rgba(245,216,122,0.3)',
                fontSize: 10, fontWeight: 700, color: '#F5D87A',
                letterSpacing: '0.06em',
              }}>
                POPULAR
              </div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{label}</div>
            <div style={{ marginBottom: 16 }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--violet-300)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display,serif', color: 'var(--violet-300)' }}>{price} ★</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>{unit}</span>
              </div>
              <div style={{
                padding: '9px 18px', borderRadius: 100,
                background: 'linear-gradient(135deg, #7C63F5, #6247D9)',
                fontSize: 13, fontWeight: 600, color: 'white',
                boxShadow: '0 4px 14px rgba(124,99,245,0.35)',
                cursor: 'pointer',
              }}>
                Купить
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div style={{
        padding: '16px',
        background: 'rgba(35,27,69,0.5)',
        border: '1px solid rgba(180,160,255,0.08)',
        borderRadius: 18,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Пригласить друга</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
          Оба получите по 5 Stars, если друг запишет первый сон
        </p>
        <button style={{
          width: '100%', padding: '10px', borderRadius: 12,
          background: 'rgba(124,99,245,0.12)',
          border: '1px solid rgba(124,99,245,0.2)',
          color: 'var(--violet-300)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>
          Скопировать реферальную ссылку
        </button>
      </div>
    </div>
  );
}
