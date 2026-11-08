import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_GROUPS, NAV_ROUTES, canAccess } from '../config/routes';
import { cn } from '../lib/utils';
import UserMenu from './UserMenu';
import logo from '../assets/logo.png';

const linkClass = ({ isActive }) => cn(
  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
  isActive ? 'bg-accent/15 text-white' : 'text-sidebar-text hover:bg-white/5 hover:text-white',
);

/** Conteúdo da navegação lateral (usado fixo no desktop e em gaveta no celular). */
export default function Sidebar({ onNavigate }) {
  const { hasPermission } = useAuth();
  const visible = NAV_ROUTES.filter((route) => canAccess(route.permissions, hasPermission));

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 flex-shrink-0 items-center gap-2.5 px-5">
        <img src={logo} alt="" className="h-9 w-9 object-contain" />
        <span className="text-lg font-extrabold tracking-tight text-white">
          Stock<span className="text-accent">Flow</span>
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Principal">
        {Object.entries(NAV_GROUPS).map(([group, title]) => {
          const items = visible.filter((route) => route.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {group !== 'main' && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-text/70">{title}</p>
              )}
              <ul className="space-y-0.5">
                {items.map(({ path, label, Icon }) => (
                  <li key={path}>
                    <NavLink to={path} className={linkClass} onClick={onNavigate}>
                      {({ isActive }) => (
                        <>
                          <Icon className={cn('h-[18px] w-[18px] flex-shrink-0', isActive ? 'text-accent' : 'text-sidebar-text group-hover:text-white')} />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-3">
        <UserMenu />
      </div>
    </div>
  );
}
