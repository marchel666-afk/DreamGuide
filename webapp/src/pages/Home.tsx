import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Stats } from '../types';
import DreamCard from '../components/DreamCard';
import StreakBadge from '../components/StreakBadge';

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  useEffect(() => {
    api.stats.get().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="page">
      {/* Header */}
      <div style={{ paddingTop: 20, paddingBottom: 8 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 3 }}>{greeting}</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 26, lineHeight: 1.15 }}>
            {tgUser?.first_name ?? 'Исследователь'}
          </h1>
          {stats && <StreakBadge days={stats.streak_days} />}
        </div>
      </div>

      {/* Hero CTA */}
      <div
        onClick={() => navigate('/new')}
        style={{
          marginTop: 20, marginBottom: 24,
          padding: '28px 24px',
          background: 'linear-gradient(145deg, rgba(98,71,217,0.4) 0%, rgba(45,27,105,0.6) 100%)',
          border: '1px solid rgba(180,160,255,0.2)',
          borderRadius: 24,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 30px rgba(98,71,217,0.2)',
          transition: 'transform 0.2s',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,99,245,0.3), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 100,
          background: 'rgba(180,160,255,0.12)',
          border: '1px solid rgba(180,160,255,0.2)',
          marginBottom: 14,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8EC8C0' }} />
          <span style={{ fontSize: 11, color: 'var(--lavender)', letterSpacing: '0.06em', fontWeight: 500 }}>
            ВАШ ДНЕВНИК СНОВ
          </span>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 8, lineHeight: 1.3 }}>
          Записать<br />новый сон
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(237,232,255,0.55)', marginBottom: 20, lineHeight: 1.55 }}>
          Сны — это письма самого себя.<br />Расшифруй их прямо сейчас.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 100,
          background: 'linear-gradient(135deg, #7C63F5, #6247D9)',
          boxShadow: '0 4px 16px rgba(124,99,245,0.45)',
          fontSize: 14, fontWeight: 600, color: 'white',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L12.5 7L7 12.5M1.5 7H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Начать
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Снов', value: stats?.total_dreams ?? 0, icon: '◐' },
          { label: 'Серия', value: (stats?.streak_days ?? 0) + 'д', icon: '✦' },
          { label: 'Stars', value: stats?.total_stars ?? 0, icon: '★' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            padding: '16px 12px', textAlign: 'center',
            background: 'rgba(35,27,69,0.5)',
            border: '1px solid rgba(180,160,255,0.08)',
            borderRadius: 18,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4, color: 'rgba(180,160,255,0.4)' }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display,serif', color: 'var(--violet-300)' }}>
              {value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent dreams */}
      <p className="section-title">Последние сны</p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      )}

      {!loading && (stats?.recent_dreams?.length ?? 0) === 0 && (
        <div style={{
          padding: '40px 24px', textAlign: 'center',
          background: 'rgba(35,27,69,0.4)',
          border: '1px solid rgba(180,160,255,0.08)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>◐</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Ещё нет записанных снов</p>
          <p style={{ color: 'var(--text-hint)', fontSize: 12, marginTop: 6 }}>
            Запишите первый — и начните познавать себя
          </p>
        </div>
      )}

      {stats?.recent_dreams?.map((dream, i) => (
        <div key={dream.id} style={{ animationDelay: `${i * 0.05}s` }}>
          <DreamCard dream={dream} />
        </div>
      ))}

      {/* Paid feature promo */}
      <div style={{
        marginTop: 8, padding: '18px',
        background: 'linear-gradient(135deg, rgba(245,216,122,0.08), rgba(232,160,192,0.06))',
        border: '1px solid rgba(245,216,122,0.15)',
        borderRadius: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 18 }}>★</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold-star)' }}>
            Сон как решение задачи
          </span>
          <span className="badge-premium" style={{ marginLeft: 'auto' }}>5 Stars</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Поставьте вопрос перед сном — AI найдёт ответ в символах вашего следующего сна.
        </p>
      </div>
    </div>
  );
}
