import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Building2 } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { useCommunities } from '../hooks/useCommunities';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/posts/PostCard';
import CreatePostForm from '../components/posts/CreatePostForm';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';

export default function FeedPage() {
  const { posts, loading, error, fetchFeed, createPost, likePost, deletePost } = usePosts();
  const { communities, fetchMyCommunities } = useCommunities();
  const toast = useToast();

  useEffect(() => {
    fetchFeed();
    fetchMyCommunities();
  }, [fetchFeed, fetchMyCommunities]);

  async function handleCreatePost(formData) {
    try { await createPost(formData); toast.success('Post published!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create post'); }
  }

  async function handleLike(id) {
    try { await likePost(id); } catch { toast.error('Failed to like post'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(id); toast.success('Post deleted'); }
    catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="page-content">
      <div className="feed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Rss size={22} color="var(--primary)" />
          <h1 className="feed-title">Your Feed</h1>
        </div>
        <p className="text-secondary text-sm">Posts from your communities</p>
      </div>

      <CreatePostForm communities={communities} onSubmit={handleCreatePost} />

      <div className="feed-posts">
        {loading && <Spinner />}
        {error && (
          <div className="card card-body" style={{ color: 'var(--danger)' }}>{error}</div>
        )}
        {!loading && !posts.length && (
          <EmptyState
            icon={<Building2 size={48} strokeWidth={1.5} />}
            title="Your feed is empty"
            description="Join some communities to see posts from people near your hometown."
            action={<Link to="/communities" className="btn btn-primary">Explore Communities</Link>}
          />
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
        ))}
      </div>

      <style>{`
        .feed-header { margin-bottom: 1.5rem; }
        .feed-title { font-size: 1.75rem; }
        .feed-posts { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
      `}</style>
    </div>
  );
}
