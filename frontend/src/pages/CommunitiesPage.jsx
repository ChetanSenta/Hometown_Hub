import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import CommunityCard from '../components/community/CommunityCard';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import api from '../utils/api';

const CATEGORIES = ['all', 'city', 'village', 'district', 'cultural', 'professional', 'other'];

export default function CommunitiesPage() {
  const { communities, loading, fetchCommunities, joinCommunity, leaveCommunity, createCommunity } = useCommunities();
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [myIds, setMyIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', city: '', state: '', category: 'city', is_private: false });

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'all') params.category = category;
    fetchCommunities(params);
  }, [search, category, fetchCommunities]);

  useEffect(() => {
    if (!user) return;
    api.get('/communities/my').then(({ data }) => setMyIds(new Set(data.communities.map((c) => c.id))));
  }, [user]);

  async function handleJoin(id) {
    try { await joinCommunity(id); setMyIds((s) => new Set([...s, id])); toast.success('Joined community!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
  }

  async function handleLeave(id) {
    try { await leaveCommunity(id); setMyIds((s) => { const n = new Set(s); n.delete(id); return n; }); toast.success('Left community'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to leave'); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try { await createCommunity(form); toast.success('Community created!'); setShowCreate(false); fetchCommunities(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
    finally { setCreating(false); }
  }

  function setField(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  return (
    <div className="page-wide">
      <div className="communities-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Building2 size={22} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>Communities</h1>
            <p className="text-secondary text-sm">Discover and join communities from your hometown</p>
          </div>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Community
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="communities-filters">
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="form-input" style={{ maxWidth: 280, paddingLeft: '2.4rem' }} placeholder="Search communities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="category-tabs">
          {CATEGORIES.map((c) => (
            <button key={c} className={`category-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && !communities.length && (
        <EmptyState icon={<Building2 size={48} strokeWidth={1.5} />} title="No communities found" description="Try a different search or category." />
      )}
      <div className="communities-grid">
        {communities.map((c) => (
          <CommunityCard key={c.id} community={c} isMember={myIds.has(c.id)} onJoin={handleJoin} onLeave={handleLeave} />
        ))}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create a Community">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Community Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => setField('name', e.target.value)} required placeholder="Jaipur Connect" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setField('description', e.target.value)} required rows={3} placeholder="What is this community about?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input className="form-input" value={form.city} onChange={(e) => setField('city', e.target.value)} required placeholder="Jaipur" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="Rajasthan" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
              {['city','village','district','cultural','professional','other'].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Community'}</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .communities-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .communities-filters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .category-tabs { display: flex; gap: 0.375rem; flex-wrap: wrap; }
        .category-tab { padding: 0.4rem 0.875rem; border-radius: var(--radius-full); border: 1.5px solid var(--border); background: var(--surface); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: var(--font-display); color: var(--text-2); }
        .category-tab:hover { border-color: var(--primary); color: var(--primary); }
        .category-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .communities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
      `}</style>
    </div>
  );
}
