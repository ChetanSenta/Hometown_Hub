import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, CalendarDays, ShieldAlert, RefreshCw, Ban, CheckCircle, AlertTriangle, Trash2, BarChart3, Settings } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/shared/Spinner';
import { formatDate } from '../utils/helpers';

const TABS = [
  { key: 'overview',     label: 'Overview',     Icon: BarChart3    },
  { key: 'users',        label: 'Users',        Icon: Users        },
  { key: 'communities',  label: 'Communities',  Icon: Building2    },
  { key: 'flagged',      label: 'Flagged',      Icon: ShieldAlert  },
];

export default function AdminPage() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, u, c, f] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/communities'),
        api.get('/admin/flagged-posts'),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.data);
      setCommunities(c.data.data);
      setFlagged(f.data.posts);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  }

  async function handleBanUser(id) {
    try {
      const { data } = await api.put(`/admin/users/${id}/ban`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_banned: data.is_banned } : u));
      toast.success(data.is_banned ? 'User banned' : 'User unbanned');
    } catch { toast.error('Action failed'); }
  }

  async function handleSetRole(id, role) {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error('Failed'); }
  }

  async function handleCommunityStatus(id, status) {
    try {
      await api.put(`/admin/communities/${id}/status`, { status });
      setCommunities((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  }

  async function handleDeletePost(id) {
    if (!window.confirm('Remove this flagged post?')) return;
    try { await api.delete(`/admin/posts/${id}`); setFlagged((prev) => prev.filter((p) => p.id !== id)); toast.success('Post removed'); }
    catch { toast.error('Failed'); }
  }

  const filteredUsers = users.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const STAT_CARDS = stats ? [
    { label: 'Total Users',         value: stats.totalUsers,         Icon: Users,        color: 'var(--primary)' },
    { label: 'Active Communities',  value: stats.activeCommunities,  Icon: Building2,    color: 'var(--accent)'  },
    { label: 'Total Posts',         value: stats.totalPosts,         Icon: FileText,     color: 'var(--purple)'  },
    { label: 'Total Events',        value: stats.totalEvents,        Icon: CalendarDays, color: 'var(--warning)' },
  ] : [];

  return (
    <div className="page-wide">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={22} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>Admin Dashboard</h1>
            <p className="text-secondary text-sm">Platform management and moderation</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAll}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} className={`admin-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={14} /> {label}
            {key === 'users' && users.length > 0 && <span className="admin-tab-count">{users.length}</span>}
            {key === 'flagged' && flagged.length > 0 && <span className="admin-tab-count" style={{ background: 'var(--danger)', color: 'white' }}>{flagged.length}</span>}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="animate-fade-in">
          <div className="admin-stats-grid">
            {STAT_CARDS.map(({ label, value, Icon, color }) => (
              <div key={label} className="stat-card card card-body">
                <div className="stat-card-icon" style={{ background: `${color}18` }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div className="stat-card-value" style={{ color }}>{value?.toLocaleString()}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card card-body" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setTab('users')}><Users size={14} /> Manage Users</button>
              <button className="btn btn-secondary" onClick={() => setTab('communities')}><Building2 size={14} /> Manage Communities</button>
              <button className={`btn ${flagged.length ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setTab('flagged')}>
                <ShieldAlert size={14} /> Flagged Posts {flagged.length > 0 && `(${flagged.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1rem' }}>
            <input className="form-input" style={{ maxWidth: 320 }} placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead><tr>{['User','Email','Role','Location','Joined','Status','Actions'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><span className="font-semibold">{u.name}</span></td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-neutral'}`}>{u.role}</span></td>
                    <td className="text-muted text-sm">{[u.hometown, u.current_city].filter(Boolean).join(' → ') || '—'}</td>
                    <td className="text-muted text-sm">{formatDate(u.created_at)}</td>
                    <td><span className={`badge ${u.is_banned ? 'badge-danger' : 'badge-success'}`}>{u.is_banned ? 'Banned' : 'Active'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`btn btn-sm ${u.is_banned ? 'btn-accent' : 'btn-danger'}`} onClick={() => handleBanUser(u.id)}>
                          {u.is_banned ? <><CheckCircle size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                        </button>
                        {u.role !== 'admin'
                          ? <button className="btn btn-sm btn-secondary" onClick={() => handleSetRole(u.id, 'admin')}>Make Admin</button>
                          : <button className="btn btn-sm btn-secondary" onClick={() => handleSetRole(u.id, 'user')}>Remove Admin</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <div className="empty-state"><p>No users found</p></div>}
          </div>
        </div>
      )}

      {/* Communities */}
      {tab === 'communities' && (
        <div className="animate-fade-in">
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead><tr>{['Community','City / State','Category','Members','Creator','Status','Actions'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-semibold">{c.name}</span></td>
                    <td className="text-muted text-sm">{c.city}{c.state ? `, ${c.state}` : ''}</td>
                    <td><span className="badge badge-neutral">{c.category}</span></td>
                    <td className="text-muted">{c.member_count}</td>
                    <td className="text-muted text-sm">{c.creator_name}</td>
                    <td><span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {c.status !== 'active'    && <button className="btn btn-sm btn-accent"  onClick={() => handleCommunityStatus(c.id, 'active')}><CheckCircle size={12} /> Activate</button>}
                        {c.status === 'active'    && <button className="btn btn-sm btn-danger"  onClick={() => handleCommunityStatus(c.id, 'suspended')}><Ban size={12} /> Suspend</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flagged Posts */}
      {tab === 'flagged' && (
        <div className="animate-fade-in">
          {flagged.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckCircle size={48} strokeWidth={1.5} color="var(--success)" /></div>
              <h3>No flagged posts</h3>
              <p>The platform looks clean!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {flagged.map((post) => (
                <div key={post.id} className="flagged-post card card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge badge-danger"><AlertTriangle size={11} /> Flagged</span>
                        <span className="text-xs text-muted">by {post.author_name} in {post.community_name}</span>
                      </div>
                      {post.title && <h4 style={{ marginBottom: '0.3rem' }}>{post.title}</h4>}
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                        {post.content?.slice(0, 300)}{post.content?.length > 300 && '…'}
                      </p>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .admin-tabs { display: flex; gap: 0.375rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .admin-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: var(--radius-full); border: 1.5px solid var(--border); background: var(--surface); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: var(--font-display); color: var(--text-2); }
        .admin-tab:hover { color: var(--primary); border-color: var(--primary); }
        .admin-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .admin-tab-count { background: var(--surface-3); color: var(--text-2); border-radius: var(--radius-full); padding: 0 0.4rem; font-size: 0.7rem; min-width: 18px; text-align: center; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 1rem; }
        .stat-card { display: flex; align-items: center; gap: 1rem; }
        .stat-card-icon { width: 52px; height: 52px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-card-value { font-size: 1.75rem; font-weight: 800; font-family: var(--font-display); line-height: 1; }
        .stat-card-label { font-size: 0.8rem; color: var(--text-3); margin-top: 0.2rem; font-weight: 500; }
        .admin-table-wrap { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .admin-table thead tr { border-bottom: 2px solid var(--border); background: var(--surface-2); }
        .admin-table th { padding: 0.875rem 1rem; text-align: left; font-family: var(--font-display); font-size: 0.75rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .admin-table tbody tr { border-bottom: 1px solid var(--border); transition: background var(--transition); }
        .admin-table tbody tr:hover { background: var(--surface-2); }
        .admin-table td { padding: 0.75rem 1rem; vertical-align: middle; }
        .flagged-post { border-left: 3px solid var(--danger); }
      `}</style>
    </div>
  );
}
