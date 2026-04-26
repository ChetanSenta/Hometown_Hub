import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Trash2, Pin, Megaphone, HelpCircle, AlertTriangle, CalendarDays, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import { timeAgo } from '../../utils/helpers';

const TYPE_CONFIG = {
  announcement: { Icon: Megaphone,      label: 'Announcement', colorClass: 'badge-warning' },
  question:     { Icon: HelpCircle,     label: 'Question',     colorClass: 'badge-accent'  },
  alert:        { Icon: AlertTriangle,  label: 'Alert',        colorClass: 'badge-danger'  },
  event_share:  { Icon: CalendarDays,   label: 'Event',        colorClass: 'badge-success' },
  post:         null,
};

export default function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const typeInfo = TYPE_CONFIG[post.type];
  const isLong = post.content?.length > 220;
  const displayContent = isLong && !expanded ? post.content.slice(0, 220) + '…' : post.content;

  return (
    <article className={`post-card card animate-fade-in ${post.is_pinned ? 'post-pinned' : ''}`}>
      {post.is_pinned && (
        <div className="post-pin-bar">
          <Pin size={12} /> Pinned Post
        </div>
      )}

      <div className="card-body">
        {/* Header */}
        <div className="post-header">
          <Avatar name={post.author_name} src={post.author_avatar} size="md" />
          <div className="post-meta">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{post.author_name}</span>
              {post.author_hometown && (
                <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MapPin size={10} /> {post.author_hometown}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.community_name && (
                <Link to={`/communities/${post.community_id}`} className="post-community-link">
                  {post.community_name}
                </Link>
              )}
              <span className="text-xs text-muted">· {timeAgo(post.created_at)}</span>
            </div>
          </div>
          {typeInfo && (
            <span className={`badge ${typeInfo.colorClass}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <typeInfo.Icon size={11} /> {typeInfo.label}
            </span>
          )}
        </div>

        {/* Content */}
        {post.title && <h3 className="post-title">{post.title}</h3>}
        <p className="post-content">
          {displayContent}
          {isLong && (
            <button className="post-expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? ' Show less' : ' Read more'}
            </button>
          )}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="badge badge-neutral">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <button
            className={`post-action-btn ${post.liked_by_me ? 'liked' : ''}`}
            onClick={() => onLike && onLike(post.id)}
            disabled={!user}
          >
            <Heart size={15} fill={post.liked_by_me ? 'currentColor' : 'none'} />
            {post.like_count || 0}
          </button>
          <button className="post-action-btn">
            <MessageCircle size={15} /> {post.comment_count || 0}
          </button>
          <button className="post-action-btn">
            <Share2 size={15} /> Share
          </button>
          {user && (user.id === post.author_id || user.role === 'admin') && (
            <button
              className="post-action-btn danger"
              onClick={() => onDelete && onDelete(post.id)}
              style={{ marginLeft: 'auto' }}
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>

      <style>{`
        .post-card { margin-bottom: 0; }
        .post-pinned { border-color: var(--yellow); border-width: 2px; }
        .post-pin-bar { background: var(--warning-faint); color: var(--warning); font-size: 0.78rem; font-weight: 600; padding: 0.35rem 1.25rem; border-bottom: 1px solid var(--border); font-family: var(--font-display); display: flex; align-items: center; gap: 0.4rem; }
        .post-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.875rem; }
        .post-meta { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
        .post-community-link { font-size: 0.78rem; font-weight: 600; color: var(--primary); background: var(--primary-faint); padding: 0.1rem 0.5rem; border-radius: var(--radius-full); }
        .post-community-link:hover { text-decoration: underline; }
        .post-title { font-size: 1.05rem; margin-bottom: 0.5rem; }
        .post-content { font-size: 0.9375rem; color: var(--text-2); line-height: 1.65; margin-bottom: 0.875rem; white-space: pre-wrap; word-break: break-word; }
        .post-expand-btn { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; font-size: 0.875rem; padding: 0; }
        .post-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.875rem; }
        .post-actions { display: flex; align-items: center; gap: 0.25rem; padding-top: 0.5rem; border-top: 1px solid var(--border); }
        .post-action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.875rem; border-radius: var(--radius-full); border: none; background: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: var(--text-2); transition: all var(--transition); font-family: var(--font-body); }
        .post-action-btn:hover { background: var(--surface-2); color: var(--text); }
        .post-action-btn.liked { color: #e11d48; }
        .post-action-btn.liked:hover { background: var(--danger-faint); }
        .post-action-btn.danger:hover { background: var(--danger-faint); color: var(--danger); }
        .post-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </article>
  );
}
