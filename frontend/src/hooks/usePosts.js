import { useState, useCallback } from 'react';
import api from '../utils/api';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try { const { data } = await api.get('/posts', { params }); setPosts(data.data); setPagination(data.pagination); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  const fetchFeed = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try { const { data } = await api.get('/posts/feed', { params }); setPosts(data.data); setPagination(data.pagination); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load feed'); }
    finally { setLoading(false); }
  }, []);

  const createPost = useCallback(async (postData) => {
    const { data } = await api.post('/posts', postData);
    setPosts((prev) => [data.post, ...prev]);
    return data;
  }, []);

  const likePost = useCallback(async (id) => {
    const { data } = await api.post(`/posts/${id}/like`);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked_by_me: data.liked, like_count: p.like_count + (data.liked ? 1 : -1) } : p));
    return data;
  }, []);

  const deletePost = useCallback(async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { posts, setPosts, pagination, loading, error, fetchPosts, fetchFeed, createPost, likePost, deletePost };
}
