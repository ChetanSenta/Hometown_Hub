import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, CalendarDays, Bell, User, Settings, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCommunities } from '../../hooks/useCommunities';
import { getInitials, avatarGradient } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/',             Icon: Home,         label: 'Feed',          authRequired: true  },
  { to: '/communities',  Icon: Building2,    label: 'Communities',   authRequired: false },
  { to: '/events',       Icon: CalendarDays, label: 'Events',        authRequired: false },
  { to: '/notifications',Icon: Bell,         label: 'Notifications', authRequired: true  },
  { to: '/profile',      Icon: User,         label: 'Profile',       authRequired: true  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { communities, fetchMyCommunities } = useCommunities();

  useEffect(() => {
    if (user) fetchMyCommunities();
  }, [user, fetchMyCommunities]);

  return (
    <aside className="sidebar hide-mobile">
      {user && (
        <div className="sidebar-user">
          <div className="avatar avatar-md" style={{ background: avatarGradient(user.name) }}>
            {getInitials(user.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="font-semibold text-sm">{user.name}</div>
            <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {user.hometown || 'Set your hometown'}
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, Icon, label, authRequired }) => {
          if (authRequired && !user) return null;
          return (
            <Link key={to} to={to} className={`sidebar-nav-item ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={18} className="sidebar-nav-icon" />
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link to="/admin" className={`sidebar-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <Settings size={18} className="sidebar-nav-icon" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {user && communities.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">My Communities</div>
          {communities.slice(0, 6).map((c) => (
            <Link key={c.id} to={`/communities/${c.id}`} className="sidebar-community-item">
              <div className="sidebar-community-dot" style={{ background: getCommunityColor(c.name) }} />
              <span className="truncate text-sm">{c.name}</span>
            </Link>
          ))}
          {communities.length > 6 && (
            <Link to="/communities" className="sidebar-see-all">See all communities</Link>
          )}
        </div>
      )}

      <style>{`
        .sidebar { position: fixed; left: 0; top: var(--nav-h); width: var(--sidebar-w); height: calc(100vh - var(--nav-h)); background: var(--surface); border-right: 1px solid var(--border); overflow-y: auto; padding: 1.25rem 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .sidebar-user { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: var(--primary-faint); border-radius: var(--radius-lg); margin-bottom: 0.75rem; }
        .sidebar-user-info { overflow: hidden; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.15rem; }
        .sidebar-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0.875rem; border-radius: var(--radius); font-size: 0.9rem; font-weight: 500; color: var(--text-2); transition: all var(--transition); }
        .sidebar-nav-item:hover { background: var(--surface-2); color: var(--text); }
        .sidebar-nav-item.active { background: var(--primary-faint); color: var(--primary); font-weight: 600; }
        .sidebar-nav-icon { flex-shrink: 0; }
        .sidebar-section { margin-top: 1rem; }
        .sidebar-section-title { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); padding: 0 0.875rem; margin-bottom: 0.5rem; font-family: var(--font-display); }
        .sidebar-community-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.875rem; border-radius: var(--radius); color: var(--text-2); transition: background var(--transition); }
        .sidebar-community-item:hover { background: var(--surface-2); color: var(--text); }
        .sidebar-community-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sidebar-see-all { display: block; padding: 0.4rem 0.875rem; font-size: 0.8rem; color: var(--primary); font-weight: 600; }
        .sidebar-see-all:hover { text-decoration: underline; }
      `}</style>
    </aside>
  );
}

function getCommunityColor(name = '') {
  const colors = ['#FF6B35','#2EC4B6','#845EC2','#FFD166','#10B981','#EF4444'];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}
