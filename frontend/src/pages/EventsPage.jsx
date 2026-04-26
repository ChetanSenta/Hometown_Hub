import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import api from '../utils/api';

export default function EventsPage() {
  const { events, loading, fetchEvents, createEvent, attendEvent } = useEvents();
  const { user } = useAuth();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [myCommunities, setMyCommunities] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', community_id: '', category: 'social',
    start_date: '', end_date: '', location_address: '', location_city: '',
    is_online: false, online_link: '', max_attendees: 0,
  });

  useEffect(() => {
    fetchEvents();
    if (user) api.get('/communities/my').then(({ data }) => setMyCommunities(data.communities));
  }, [fetchEvents, user]);

  async function handleAttend(id) {
    try { await attendEvent(id, 'going'); toast.success("You're going!"); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to RSVP'); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try { await createEvent(form); toast.success('Event created!'); setShowCreate(false); fetchEvents(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setCreating(false); }
  }

  function setField(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  return (
    <div className="page-wide">
      <div className="events-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarDays size={22} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>Events</h1>
            <p className="text-secondary text-sm">Local events from your communities</p>
          </div>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {!loading && !events.length && (
        <EmptyState icon={<CalendarDays size={48} strokeWidth={1.5} />} title="No upcoming events" description="Be the first to create an event in your community!" />
      )}
      <div className="events-grid">
        {events.map((ev) => <EventCard key={ev.id} event={ev} onAttend={handleAttend} />)}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Event">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setField('title', e.target.value)} required placeholder="Onam Sadya 2025" />
          </div>
          <div className="form-group">
            <label className="form-label">Community *</label>
            <select className="form-select" value={form.community_id} onChange={(e) => setField('community_id', e.target.value)} required>
              <option value="">Select community</option>
              {myCommunities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="datetime-local" className="form-input" value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input type="datetime-local" className="form-input" value={form.end_date} onChange={(e) => setField('end_date', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
              {['social','cultural','sports','education','health','business','other'].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-input" value={form.location_address} onChange={(e) => setField('location_address', e.target.value)} placeholder="Venue address" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.location_city} onChange={(e) => setField('location_city', e.target.value)} placeholder="Mumbai" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Event'}</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .events-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
      `}</style>
    </div>
  );
}
