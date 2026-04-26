import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/notifications'); setNotifications(data.data); }
    catch (_) {} finally { setLoading(false); }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try { const { data } = await api.get('/notifications/unread-count'); setUnreadCount(data.count); }
    catch (_) {}
  }, []);

  const markRead = useCallback(async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, deleteNotification };
}
