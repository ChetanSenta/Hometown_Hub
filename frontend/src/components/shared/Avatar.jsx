import React from 'react';
import { getInitials, avatarGradient } from '../../utils/helpers';

export default function Avatar({ name = '', src = '', size = 'md', className = '' }) {
  if (src) {
    return (
      <div className={`avatar avatar-${size} ${className}`} style={{ background: '#eee' }}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div className={`avatar avatar-${size} ${className}`} style={{ background: avatarGradient(name) }} title={name}>
      {getInitials(name)}
    </div>
  );
}
