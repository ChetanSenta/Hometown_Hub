import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, FileText, MapPin, UserCheck, UserPlus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import CreatePostForm from '../components/posts/CreatePostForm';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import Avatar from '../components/shared/Avatar';
import { pluralize } from '../utils/helpers';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { posts, loading: postsLoading, fetchPosts, createPost, likePost, deletePost } = usePosts();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [commRes, memRes] = await Promise.all([
          api.get(`/communities/${id}`),
          api.get(`/communities/${id}/members`),
        ]);
        setCommunity(commRes.data.community);
        setMembers(memRes.data.members);
        if (user) setIsMember(memRes.data.members.some((m) => m.id === user.id));
      } catch { toast.error('Community not found'); }
      finally { setLoading(false); }
    }
    load();
    fetchPosts({ community_id: id });
  }, [id, user, fetchPosts, toast]);

  async function handleJoinLeave() {
    try {
      if (isMember) {
        await api.delete(`/communities/${id}/leave`);
        setIsMember(false);
        toast.success('Left community');
      } else {
        await api.post(`/communities/${id}/join`);
        setIsMember(true);
        toast.success('Joined!');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  }

  async function handleCreatePost(data) {
    await createPost({ ...data, community_id: id });
    toast.success('Posted!');
  }

  if (loading) return <Spinner />;
  if (!community) return <EmptyState title="Community not found" />;

  const TABS = [
    { key: 'posts',   label: 'Posts',   Icon: FileText },
    { key: 'members', label: 'Members', Icon: Users    },
  ];

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="community-hero card">
        <div className="community-hero-cover" style={{ background: 'linear-gradient(135deg,#FF6B35,#845EC2)' }} />
        <div className="community-hero-body">
          <div className="community-hero-name-block">
            <h1 className="community-hero-name">{community.name}</h1>
            <p className="text-secondary text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> {community.city}{community.state ? `, ${community.state}` : ''}&nbsp;&nbsp;
              <Users size={13} /> {pluralize(community.member_count, 'member')}
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '0.35rem' }}>{community.description}</p>
          </div>
          {user && (
            <button className={`btn btn-sm ${isMember ? 'btn-secondary' : 'btn-primary'}`} onClick={handleJoinLeave}>
              {isMember ? <><UserCheck size={14} /> Joined</> : <><UserPlus size={14} /> Join</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="community-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} className={`community-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isMember && <CreatePostForm communities={[community]} onSubmit={handleCreatePost} />}
          {postsLoading && <Spinner />}
          {!postsLoading && !posts.length && (
            <EmptyState icon={<FileText size={48} strokeWidth={1.5} />} title="No posts yet" description={isMember ? 'Be the first to post!' : 'Join to see and create posts.'} />
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={likePost} onDelete={deletePost} />
          ))}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="members-grid">
          {members.map((m) => (
            <div key={m.id} className="member-card card card-body">
              <Avatar name={m.name} size="md" />
              <div style={{ minWidth: 0 }}>
                <div className="font-semibold text-sm truncate">{m.name}</div>
                {m.hometown && (
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={10} /> {m.hometown}
                  </div>
                )}
                {m.role === 'moderator' && <span className="badge badge-accent" style={{ marginTop: '0.25rem' }}>Moderator</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .community-hero { margin-bottom: 1rem; }
        .community-hero-cover { height: 90px; }
        .community-hero-body { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; flex-wrap: wrap; }
        .community-hero-name-block { flex: 1; min-width: 0; }
        .community-hero-name { font-size: 1.4rem; margin-bottom: 0.3rem; }
        .community-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; }
        .community-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-full); border: 1.5px solid var(--border); background: var(--surface); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: var(--font-display); color: var(--text-2); }
        .community-tab:hover { color: var(--primary); border-color: var(--primary); }
        .community-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        .member-card.card-body { display: flex; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
