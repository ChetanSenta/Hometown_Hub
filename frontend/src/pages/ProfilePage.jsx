import React, { useState, useEffect } from 'react';
import { User, Building2, Lock, MapPin, Save, Key, ShieldCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Avatar from '../components/shared/Avatar';
import { formatDate } from '../utils/helpers';

const TABS = [
  { key: 'profile',     label: 'Profile',     Icon: User      },
  { key: 'communities', label: 'Communities', Icon: Building2 },
  { key: 'security',    label: 'Security',    Icon: Lock      },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', bio: '', hometown: '', current_city: '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [myCommunities, setMyCommunities] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', hometown: user.hometown || '', current_city: user.current_city || '' });
      api.get('/communities/my').then(({ data }) => setMyCommunities(data.communities)).catch(() => {});
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try { const { data } = await api.put('/auth/profile', form); updateUser(data.user); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
  }

  if (!user) return null;

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="profile-hero card">
        <div className="profile-hero-bg" />
        <div className="profile-hero-body">
          <Avatar name={user.name} size="xl" className="profile-avatar" />
          <div className="profile-hero-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="text-muted text-sm">{user.email}</p>
            <div className="profile-badges">
              {user.role === 'admin'  && <span className="badge badge-danger"><ShieldCheck size={11} /> Admin</span>}
              {user.is_verified       && <span className="badge badge-success"><BadgeCheck size={11} /> Verified</span>}
              {user.hometown          && <span className="badge badge-neutral"><MapPin size={11} /> {user.hometown}</span>}
              {user.current_city      && <span className="badge badge-accent"><MapPin size={11} /> {user.current_city}</span>}
            </div>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
          <div className="profile-joined">
            <span className="text-xs text-muted">Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} className={`profile-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Edit */}
      {tab === 'profile' && (
        <div className="card card-body animate-fade-in">
          <h3 style={{ marginBottom: '1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Bio <span className="text-muted">(max 500 chars)</span></label>
              <textarea className="form-textarea" rows={3} value={form.bio} maxLength={500} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell your community about yourself..." />
              <div className="text-xs text-muted" style={{ textAlign: 'right' }}>{form.bio.length}/500</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Hometown</label>
                <input className="form-input" value={form.hometown} onChange={(e) => setForm((f) => ({ ...f, hometown: e.target.value }))} placeholder="Jaipur" />
              </div>
              <div className="form-group">
                <label className="form-label">Current City</label>
                <input className="form-input" value={form.current_city} onChange={(e) => setForm((f) => ({ ...f, current_city: e.target.value }))} placeholder="Bangalore" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Communities */}
      {tab === 'communities' && (
        <div className="animate-fade-in">
          {myCommunities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Building2 size={48} strokeWidth={1.5} /></div>
              <h3>No communities yet</h3>
              <p>Join communities to see them here.</p>
            </div>
          ) : (
            <div className="profile-communities-grid">
              {myCommunities.map((c) => (
                <a key={c.id} href={`/communities/${c.id}`} className="profile-community-card card card-body">
                  <div className="profile-community-icon"><Building2 size={20} color="var(--primary)" /></div>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} /> {c.city}
                    </div>
                    {c.my_role === 'moderator' && <span className="badge badge-accent" style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>Moderator</span>}
                  </div>
                  <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-3)' }} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="card card-body animate-fade-in">
          <h3 style={{ marginBottom: '1.25rem' }}>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required minLength={6} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} required minLength={6} placeholder="Re-enter new password" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" type="submit"><Key size={14} /> Update Password</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .profile-hero { margin-bottom: 1rem; overflow: visible; }
        .profile-hero-bg { height: 80px; background: linear-gradient(135deg,#1A1A2E,#0F3460); }
        .profile-hero-body { display: flex; align-items: flex-start; gap: 1.25rem; padding: 0 1.5rem 1.5rem; flex-wrap: wrap; }
        .profile-avatar { margin-top: -2.5rem; border: 4px solid white; box-shadow: var(--shadow); }
        .profile-hero-info { flex: 1; min-width: 0; padding-top: 0.5rem; }
        .profile-name { font-size: 1.5rem; margin-bottom: 0.2rem; }
        .profile-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }
        .profile-bio { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; margin-top: 0.5rem; }
        .profile-joined { margin-left: auto; padding-top: 0.5rem; }
        .profile-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; }
        .profile-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-full); border: 1.5px solid var(--border); background: var(--surface); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: var(--font-display); color: var(--text-2); }
        .profile-tab:hover { color: var(--primary); border-color: var(--primary); }
        .profile-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .profile-communities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        .profile-community-card { display: flex; align-items: center; gap: 0.75rem; color: inherit; transition: all var(--transition); }
        .profile-community-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
        .profile-community-icon { width: 40px; height: 40px; background: var(--primary-faint); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
