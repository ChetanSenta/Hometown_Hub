import React, { useEffect } from 'react';
import { Bell, Users, CheckCircle, Heart, MessageCircle, CalendarDays, Megaphone, UserPlus, AtSign, Trash2, BellOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import { timeAgo } from '../utils/helpers';

const TYPE_ICONS = {
  community_join:     Users,
  community_approved: CheckCircle,
  post_like:          Heart,
  post_comment:       MessageCircle,
  event_reminder:     CalendarDays,
  announcement:       Megaphone,
  new_member:         UserPlus,
  mention:            AtSign,
};

export default function NotificationsPage() {
  const { notifications, loading, fetchNotifications, markRead, markAllRead, deleteNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function handleMarkAll() {
    await markAllRead();
    toast.success('All notifications marked as read');
  }

  const unread = notifications.filter((n) => !n.is_read);

  return (
    <div className="page-content">
      <div className="notif-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bell size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.75rem' }}>Notifications</h1>
          {unread.length > 0 && <span className="badge badge-primary">{unread.length}</span>}
        </div>
        {unread.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAll}>
            <CheckCircle size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {!loading && !notifications.length && (
        <EmptyState icon={<BellOff size={48} strokeWidth={1.5} />} title="No notifications" description="You're all caught up!" />
      )}

      <div className="notif-list">
        {notifications.map((n) => {
          const IconComponent = TYPE_ICONS[n.type] || Bell;
          return (
            <div
              key={n.id}
              className={`notif-item card card-body ${!n.is_read ? 'notif-unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="notif-icon">
                <IconComponent size={16} />
              </div>
              <div className="notif-content">
                {n.sender_name && <span className="font-semibold">{n.sender_name} </span>}
                <span style={{ color: 'var(--text-2)' }}>{n.message}</span>
                <div className="notif-time">{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && <div className="notif-dot" />}
              <button
                className="notif-delete"
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .notif-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .notif-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .notif-item { display: flex; align-items: flex-start; gap: 0.875rem; cursor: pointer; transition: all var(--transition); position: relative; }
        .notif-item:hover { box-shadow: var(--shadow); }
        .notif-unread { border-left: 3px solid var(--primary); background: var(--primary-faint); }
        .notif-icon { width: 36px; height: 36px; background: var(--surface-2); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--text-2); }
        .notif-content { flex: 1; font-size: 0.9rem; line-height: 1.5; }
        .notif-time { font-size: 0.78rem; color: var(--text-3); margin-top: 0.2rem; }
        .notif-dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; flex-shrink: 0; margin-top: 0.35rem; }
        .notif-delete { background: none; border: none; cursor: pointer; color: var(--text-3); padding: 0.25rem; border-radius: var(--radius-sm); transition: all var(--transition); display: flex; align-items: center; }
        .notif-delete:hover { background: var(--danger-faint); color: var(--danger); }
      `}</style>
    </div>
  );
}
