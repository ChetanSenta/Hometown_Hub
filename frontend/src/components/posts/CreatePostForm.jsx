import React, { useState } from 'react';
import { Megaphone, HelpCircle, AlertTriangle, CalendarDays, FileText, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import Modal from '../shared/Modal';

const POST_TYPES = [
  { value: 'post',         label: 'Post',         Icon: FileText      },
  { value: 'announcement', label: 'Announcement',  Icon: Megaphone     },
  { value: 'question',     label: 'Question',      Icon: HelpCircle    },
  { value: 'alert',        label: 'Alert',         Icon: AlertTriangle },
];

export default function CreatePostForm({ communities = [], onSubmit }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    community_id: communities[0]?.id || '',
    type: 'post',
    title: '',
    content: '',
    tags: '',
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.content.trim() || !form.community_id) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setForm((f) => ({ ...f, title: '', content: '', tags: '', type: 'post' }));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <div className="create-post-trigger card" onClick={() => setOpen(true)}>
        <Avatar name={user.name} size="md" />
        <div className="create-post-placeholder">What's happening in your community?</div>
        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
          <Send size={13} /> Post
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create a Post">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Community */}
          {communities.length > 0 && (
            <div className="form-group">
              <label className="form-label">Post to Community *</label>
              <select name="community_id" value={form.community_id} onChange={handleChange} className="form-select" required>
                <option value="">Select community</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Post Type</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {POST_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`btn btn-sm ${form.type === value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm((f) => ({ ...f, type: value }))}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title <span className="text-muted">(optional)</span></label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Give your post a title..." maxLength={200} />
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea className="form-textarea" name="content" value={form.content} onChange={handleChange} placeholder="Share something with your community..." rows={5} required maxLength={5000} style={{ minHeight: 120 }} />
            <div className="text-xs text-muted" style={{ textAlign: 'right' }}>{form.content.length}/5000</div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags <span className="text-muted">(comma-separated)</span></label>
            <input className="form-input" name="tags" value={form.tags} onChange={handleChange} placeholder="culture, festival, food" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !form.content.trim()}>
              <Send size={14} /> {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .create-post-trigger { display: flex; align-items: center; gap: 0.875rem; padding: 1rem 1.25rem; cursor: pointer; transition: box-shadow var(--transition); }
        .create-post-trigger:hover { box-shadow: var(--shadow); }
        .create-post-placeholder { flex: 1; color: var(--text-3); font-size: 0.9375rem; background: var(--surface-2); border-radius: var(--radius-full); padding: 0.6rem 1rem; border: 1.5px solid var(--border); cursor: text; }
      `}</style>
    </>
  );
}
