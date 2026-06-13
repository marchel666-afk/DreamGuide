import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusIcon, GridIcon, CalendarIcon, UserIcon } from './Icons';

const tabs = [
  { to: '/',        icon: HomeIcon,     label: 'Главная' },
  { to: '/gallery', icon: GridIcon,     label: 'Галерея' },
  { to: '/new',     icon: PlusIcon,     label: '',         center: true },
  { to: '/stats',   icon: CalendarIcon, label: 'Статистика' },
  { to: '/profile', icon: UserIcon,     label: 'Профиль' },
];

export default function Navigation() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--nav-height)',
      background: 'linear-gradient(180deg, rgba(11,8,24,0) 0%, rgba(17,13,34,0.97) 30%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(180,160,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      zIndex: 100,
    }}>
      {tabs.map(({ to, icon: Icon, label, center }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
        >
          {({ isActive }) =>
            center ? (
              <div style={{
                width: 52, height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #7C63F5, #6247D9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(124,99,245,0.5), 0 0 0 4px rgba(124,99,245,0.15)',
                marginTop: -20,
                transition: 'all 0.2s',
              }}>
                <Icon size={22} color="white" />
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 0',
                transition: 'all 0.2s',
              }}>
                <Icon size={21} color={isActive ? '#B8A9FF' : 'rgba(237,232,255,0.3)'} />
                <span style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.02em',
                  color: isActive ? '#B8A9FF' : 'rgba(237,232,255,0.3)',
                  transition: 'color 0.2s',
                }}>
                  {label}
                </span>
                {isActive && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#B8A9FF',
                    position: 'absolute',
                    bottom: 10,
                  }} />
                )}
              </div>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
