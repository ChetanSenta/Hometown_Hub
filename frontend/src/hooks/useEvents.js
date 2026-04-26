import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try { const { data } = await api.get('/events', { params }); setEvents(data.data); setPagination(data.pagination); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    const { data } = await api.post('/events', eventData);
    setEvents((prev) => [data.event, ...prev]);
    return data;
  }, []);

  const attendEvent = useCallback(async (id, status = 'going') => {
    const { data } = await api.post(`/events/${id}/attend`, { status });
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, my_attendance: data.status, attendee_count: e.attendee_count + 1 } : e));
    return data;
  }, []);

  return { events, pagination, loading, error, fetchEvents, createEvent, attendEvent };
}
