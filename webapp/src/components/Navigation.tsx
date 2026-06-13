import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusIcon, GridIcon, CalendarIcon, UserIcon } from './Icons';

const tabs = [
  { to: '/', icon: HomeIcon, label: 'Главная' },
  { to: '/gallery', icon: GridIcon, label: 'Галерея' },
  { to: '/new', icon: PlusIcon, label: 'Сон', center: true },
  { to: '/stats', icon: CalendarIcon, label: 'Статистика' },
  { to: '/profile', icon: UserIcon, label: 'Профиль' },
];

export default function Navigation() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 100,
      }}
    >
      {tabs.map(({ to, icon: Icon, label, center }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            flex: 1,
            padding: '6px 0',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
            transition: 'color 0.2s',
            position: 'relative',
          })}
        >
          {({ isActive }) =>
            center ? (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--glow-primary)',
                  marginTop: -20,
                }}
              >
                <Icon size={22} color="white" />
              </div>
            ) : (
              <>
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
