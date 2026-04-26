import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, ArrowRight, Users, Megaphone, CalendarDays, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const FEATURES = [
  { Icon: Users,        text: 'Join local city and village communities' },
  { Icon: Megaphone,    text: 'Share posts and announcements' },
  { Icon: CalendarDays, text: 'Discover and join local events' },
  { Icon: Bell,         text: 'Stay notified on community updates' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) { toast.success('Welcome back!'); navigate('/'); }
    else toast.error(result.message);
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left hide-mobile">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><MapPin size={22} strokeWidth={2.5} /></div>
            HometownHub
          </div>
          <h1 className="auth-left-title">Connect with your roots</h1>
          <p className="auth-left-sub">Join thousands of people staying connected with their hometown communities.</p>
          <div className="auth-features">
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} className="auth-feature-item">
                <div className="auth-feature-icon"><Icon size={16} /></div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-logo show-mobile">
              <MapPin size={28} color="var(--primary)" />
            </div>
            <h2>Welcome back</h2>
            <p className="text-secondary text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input type="email" name="email" className="form-input auth-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoFocus />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input type="password" name="password" className="form-input auth-input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-demo-creds">
            <div className="auth-demo-title">Demo Credentials</div>
            <div className="text-sm text-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Admin:</strong> admin@hometownhub.com / admin123</div>
              <div><strong>User:</strong> priya@example.com / password123</div>
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="text-primary font-semibold">Create one <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left { flex: 1; background: linear-gradient(145deg,#1A1A2E,#16213E,#0F3460); display: flex; align-items: center; justify-content: center; padding: 3rem; position: relative; overflow: hidden; }
        .auth-left::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(255,107,53,0.15) 0%, transparent 60%); }
        .auth-left-content { position: relative; z-index: 1; max-width: 400px; }
        .auth-brand { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--primary); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
        .auth-brand-icon { width: 40px; height: 40px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .auth-left-title { font-size: 2.4rem; font-weight: 800; color: white; margin-bottom: 1rem; line-height: 1.2; }
        .auth-left-sub { color: rgba(255,255,255,0.6); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6; }
        .auth-features { display: flex; flex-direction: column; gap: 0.75rem; }
        .auth-feature-item { color: rgba(255,255,255,0.8); font-size: 0.9rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.06); border-radius: var(--radius); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.75rem; }
        .auth-feature-icon { width: 30px; height: 30px; background: rgba(255,107,53,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
        .auth-right { width: 480px; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bg); }
        .auth-card { width: 100%; max-width: 380px; }
        .auth-card-header { margin-bottom: 2rem; }
        .auth-card-logo { margin-bottom: 1rem; }
        .auth-card-header h2 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
        .auth-input-wrap { position: relative; }
        .auth-input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
        .auth-input { padding-left: 2.5rem !important; }
        .auth-demo-creds { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; margin-bottom: 1.5rem; }
        .auth-demo-title { font-size: 0.7rem; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .auth-switch { text-align: center; font-size: 0.9rem; color: var(--text-2); }
        @media (max-width: 768px) { .auth-right { width: 100%; } }
      `}</style>
    </div>
  );
}
