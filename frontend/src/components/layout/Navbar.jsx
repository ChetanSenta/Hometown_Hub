import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, CalendarDays, Bell, User, Settings, LogOut, Menu, X, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { getInitials, avatarGradient } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/',           label: 'Feed',        Icon: Home },
  { to: '/communities',label: 'Communities', Icon: Building2 },
  { to: '/events',     label: 'Events',      Icon: CalendarDays },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) fetchUnreadCount();
    const interval = setInterval(() => { if (user) fetchUnreadCount(); }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon"><MapPin size={20} strokeWidth={2.5} /></div>
          <span className="navbar-brand-text">Hometown<strong>Hub</strong></span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links hide-mobile">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={`navbar-link ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              <div className="navbar-avatar-wrap" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="avatar avatar-sm" style={{ background: avatarGradient(user.name), cursor: 'pointer' }}>
                  {getInitials(user.name)}
                </div>
                {menuOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link to="/profile" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                        <Settings size={15} /> Admin Dashboard
                      </Link>
                    )}
                    <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: var(--nav-h);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .navbar-scrolled { border-bottom-color: var(--border); box-shadow: var(--shadow-sm); }
        .navbar-inner { max-width: 1280px; margin: 0 auto; height: 100%; display: flex; align-items: center; padding: 0 1.5rem; gap: 2rem; }
        .navbar-brand { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display); font-size: 1.2rem; color: var(--text); }
        .navbar-brand-icon { width: 34px; height: 34px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .navbar-brand-text strong { color: var(--primary); }
        .navbar-links { display: flex; align-items: center; gap: 0.25rem; flex: 1; }
        .navbar-link { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: var(--radius-full); font-size: 0.9rem; font-weight: 500; color: var(--text-2); transition: all var(--transition); }
        .navbar-link:hover { background: var(--surface-2); color: var(--text); }
        .navbar-link.active { background: var(--primary-faint); color: var(--primary); font-weight: 600; }
        .navbar-right { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
        .navbar-icon-btn { position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius); background: var(--surface-2); transition: background var(--transition); cursor: pointer; color: var(--text-2); }
        .navbar-icon-btn:hover { background: var(--surface-3); color: var(--text); }
        .navbar-badge { position: absolute; top: -4px; right: -4px; background: var(--primary); color: #fff; font-size: 0.6rem; font-weight: 700; width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); border: 2px solid white; }
        .navbar-avatar-wrap { position: relative; }
        .navbar-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); min-width: 200px; overflow: hidden; animation: fadeInUp 0.2s ease; z-index: 200; }
        .navbar-dropdown-header { padding: 0.875rem 1rem; background: var(--surface-2); }
        .navbar-dropdown-divider { height: 1px; background: var(--border); }
        .navbar-dropdown-item { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.7rem 1rem; font-size: 0.875rem; font-weight: 500; color: var(--text-2); background: none; border: none; cursor: pointer; transition: background var(--transition); font-family: var(--font-body); }
        .navbar-dropdown-item:hover { background: var(--surface-2); color: var(--text); }
        .navbar-dropdown-item.danger:hover { background: var(--danger-faint); color: var(--danger); }
      `}</style>
    </nav>
  );
}
