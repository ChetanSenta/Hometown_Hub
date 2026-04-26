import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title = 'Nothing here yet', description = '', action = null }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        {icon || <Inbox size={48} strokeWidth={1.5} />}
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
    </div>
  );
}
