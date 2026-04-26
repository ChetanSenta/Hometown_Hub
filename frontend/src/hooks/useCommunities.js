import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useCommunities() {
  const [communities, setCommunities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommunities = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/communities', { params });
      setCommunities(data.data); setPagination(data.pagination);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load communities'); }
    finally { setLoading(false); }
  }, []);

  const fetchMyCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/communities/my');
      setCommunities(data.communities);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const joinCommunity   = useCallback(async (id) => { const { data } = await api.post(`/communities/${id}/join`); return data; }, []);
  const leaveCommunity  = useCallback(async (id) => { const { data } = await api.delete(`/communities/${id}/leave`); return data; }, []);
  const createCommunity = useCallback(async (fd) => { const { data } = await api.post('/communities', fd); return data; }, []);

  return { communities, pagination, loading, error, fetchCommunities, fetchMyCommunities, joinCommunity, leaveCommunity, createCommunity };
}
