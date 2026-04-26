import React from 'react';
import { MapPin, Users, Calendar, Globe, CheckCircle, Plus, Handshake, Music, Dumbbell, BookOpen, Heart, Briefcase, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, pluralize } from '../../utils/helpers';

const CATEGORY_ICONS = {
  social:     Handshake,
  cultural:   Music,
  sports:     Dumbbell,
  education:  BookOpen,
  health:     Heart,
  business:   Briefcase,
  other:      Tag,
};

export default function EventCard({ event, onAttend }) {
  const { user } = useAuth();
  const CategoryIcon = CATEGORY_ICONS[event.category] || Tag;
  const isPast = new Date(event.end_date) < new Date();
  const isFull = event.max_attendees > 0 && event.attendee_count >= event.max_attendees;

  return (
    <div className={`event-card card animate-fade-in ${isPast ? 'event-past' : ''}`}>
      <div className="event-card-header">
        <div className="event-card-icon">
          <CategoryIcon size={22} strokeWidth={1.8} />
        </div>
        <div className="event-card-badges">
          <span className="badge badge-accent">{event.category}</span>
          {event.is_online && <span className="badge badge-neutral"><Globe size={10} /> Online</span>}
          {isFull && <span className="badge badge-danger">Full</span>}
          {isPast && <span className="badge badge-neutral">Ended</span>}
        </div>
      </div>

      <div className="card-body" style={{ paddingTop: '0.75rem' }}>
        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-meta">
          <div className="event-meta-item">
            <Calendar size={13} /> {formatDateTime(event.start_date)}
          </div>
          {(event.location_city || event.location_address) && (
            <div className="event-meta-item">
              <MapPin size={13} /> {event.location_address || event.location_city}
            </div>
          )}
          <div className="event-meta-item">
            <Tag size={13} /> {event.community_name}
          </div>
        </div>

        <p className="event-card-desc">{event.description}</p>

        <div className="event-card-footer">
          <div className="event-card-attendees">
            <Users size={13} /> {pluralize(event.attendee_count, 'attendee')}
            {event.max_attendees > 0 && ` / ${event.max_attendees}`}
          </div>
          {user && !isPast && (
            event.my_attendance === 'going'
              ? <span className="btn btn-sm btn-accent"><CheckCircle size={13} /> Going</span>
              : (
                <button className="btn btn-primary btn-sm" onClick={() => onAttend && onAttend(event.id)} disabled={isFull}>
                  <Plus size={13} /> {isFull ? 'Full' : 'Attend'}
                </button>
              )
          )}
        </div>
      </div>

      <style>{`
        .event-card { transition: all 0.25s ease; }
        .event-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .event-past { opacity: 0.7; }
        .event-card-header { padding: 1rem 1.25rem 0; display: flex; align-items: center; justify-content: space-between; }
        .event-card-icon { width: 48px; height: 48px; background: var(--accent-faint); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: var(--accent-dark); }
        .event-card-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .event-card-title { font-size: 1rem; margin-bottom: 0.75rem; }
        .event-card-meta { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.75rem; }
        .event-meta-item { font-size: 0.82rem; color: var(--text-2); font-weight: 500; display: flex; align-items: center; gap: 0.4rem; }
        .event-card-desc { font-size: 0.875rem; color: var(--text-3); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem; }
        .event-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .event-card-attendees { font-size: 0.82rem; color: var(--text-3); font-weight: 500; display: flex; align-items: center; gap: 0.4rem; }
      `}</style>
    </div>
  );
}
