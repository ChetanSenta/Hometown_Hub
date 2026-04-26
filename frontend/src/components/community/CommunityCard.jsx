import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Check, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pluralize } from '../../utils/helpers';

export default function CommunityCard({ community, onJoin, onLeave, isMember }) {
  const { user } = useAuth();

  return (
    <div className="card community-card animate-fade-in">
      <div className="community-card-cover" style={{ background: getCoverGradient(community.name) }}>
        {community.cover_image && (
          <img src={community.cover_image} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        )}
        <div className="community-card-category">
          <span className="badge badge-primary">{community.category}</span>
        </div>
      </div>

      <div className="card-body">
        <Link to={`/communities/${community.id}`}>
          <h3 className="community-card-name">{community.name}</h3>
        </Link>
        <p className="community-card-location">
          <MapPin size={12} style={{ display: 'inline', marginRight: 3 }} />
          {community.city}{community.state ? `, ${community.state}` : ''}
        </p>
        <p className="community-card-desc">{community.description}</p>

        <div className="community-card-footer">
          <div className="community-card-stats">
            <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
            {pluralize(community.member_count, 'member')}
          </div>
          {user && (
            isMember
              ? (
                <button className="btn btn-secondary btn-sm" onClick={() => onLeave(community.id)}>
                  <Check size={13} /> Joined
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => onJoin(community.id)}>
                  <Plus size={13} /> Join
                </button>
              )
          )}
        </div>
      </div>

      <style>{`
        .community-card { transition: all 0.25s ease; }
        .community-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .community-card-cover { position: relative; height: 100px; overflow: hidden; }
        .community-card-category { position: absolute; top: 0.75rem; right: 0.75rem; }
        .community-card-name { font-size: 1rem; margin-bottom: 0.2rem; color: var(--text); transition: color 0.2s; }
        .community-card-name:hover { color: var(--primary); }
        .community-card-location { font-size: 0.78rem; color: var(--text-3); margin-bottom: 0.5rem; display: flex; align-items: center; }
        .community-card-desc { font-size: 0.875rem; color: var(--text-2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem; }
        .community-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .community-card-stats { font-size: 0.8rem; color: var(--text-3); font-weight: 500; display: flex; align-items: center; }
      `}</style>
    </div>
  );
}

function getCoverGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg,#FF6B35,#FF8C5A)',
    'linear-gradient(135deg,#2EC4B6,#54D4C9)',
    'linear-gradient(135deg,#845EC2,#B39DDB)',
    'linear-gradient(135deg,#FFD166,#FFA41B)',
    'linear-gradient(135deg,#06D6A0,#1B998B)',
    'linear-gradient(135deg,#EF4444,#F87171)',
  ];
  return gradients[(name.charCodeAt(0) || 0) % gradients.length];
}
