import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', hometown: '', current_city: '' });

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await register(form);
    if (result.success) { toast.success('Account created! Welcome to HometownHub'); navigate('/'); }
    else toast.error(result.message);
  }

  const fields = [
    { name: 'name',         label: 'Full Name',     type: 'text',     placeholder: 'Priya Sharma',       Icon: User,  required: true },
    { name: 'email',        label: 'Email',         type: 'email',    placeholder: 'you@example.com',     Icon: Mail,  required: true },
    { name: 'password',     label: 'Password',      type: 'password', placeholder: 'Min. 6 characters',   Icon: Lock,  required: true, minLength: 6 },
  ];

  return (
    <div className="auth-page">
      <div className="auth-left hide-mobile">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><MapPin size={22} strokeWidth={2.5} /></div>
            HometownHub
          </div>
          <h1 className="auth-left-title">Your community, everywhere you go</h1>
          <p className="auth-left-sub">No matter where life takes you, your hometown is always home.</p>
          <div className="auth-visual">
            <Globe size={100} strokeWidth={0.8} color="rgba(255,255,255,0.1)" />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-logo show-mobile"><MapPin size={28} color="var(--accent)" /></div>
            <h2>Create account</h2>
            <p className="text-secondary text-sm">Join your hometown community today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {fields.map(({ name, label, type, placeholder, Icon, required, minLength }) => (
              <div key={name} className="form-group">
                <label className="form-label">{label}</label>
                <div className="auth-input-wrap">
                  <Icon size={16} className="auth-input-icon" />
                  <input type={type} name={name} className="form-input auth-input" placeholder={placeholder} value={form[name]} onChange={handleChange} required={required} minLength={minLength} autoFocus={name === 'name'} />
                </div>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Hometown</label>
                <div className="auth-input-wrap">
                  <MapPin size={16} className="auth-input-icon" />
                  <input type="text" name="hometown" className="form-input auth-input" placeholder="Jaipur" value={form.hometown} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current City</label>
                <div className="auth-input-wrap">
                  <MapPin size={16} className="auth-input-icon" />
                  <input type="text" name="current_city" className="form-input auth-input" placeholder="Bangalore" value={form.current_city} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left { flex: 1; background: linear-gradient(145deg,#0F3460,#16213E,#1A1A2E); display: flex; align-items: center; justify-content: center; padding: 3rem; position: relative; overflow: hidden; }
        .auth-left::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 50%, rgba(46,196,182,0.15) 0%, transparent 60%); }
        .auth-left-content { position: relative; z-index: 1; max-width: 400px; }
        .auth-brand { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--accent); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
        .auth-brand-icon { width: 40px; height: 40px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .auth-left-title { font-size: 2.2rem; font-weight: 800; color: white; margin-bottom: 1rem; line-height: 1.2; }
        .auth-left-sub { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
        .auth-visual { display: flex; justify-content: center; margin-top: 1rem; }
        .auth-right { width: 480px; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bg); }
        .auth-card { width: 100%; max-width: 400px; }
        .auth-card-header { margin-bottom: 2rem; }
        .auth-card-logo { margin-bottom: 1rem; }
        .auth-card-header h2 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.125rem; margin-bottom: 1.5rem; }
        .auth-input-wrap { position: relative; }
        .auth-input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
        .auth-input { padding-left: 2.5rem !important; }
        .auth-switch { text-align: center; font-size: 0.9rem; color: var(--text-2); }
        @media (max-width: 768px) { .auth-right { width: 100%; } }
      `}</style>
    </div>
  );
}
