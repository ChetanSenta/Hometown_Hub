module.exports = {
  // User roles
  ROLES: { USER: 'user', ADMIN: 'admin' },

  // Community
  COMMUNITY_CATEGORIES: ['city', 'village', 'district', 'state', 'cultural', 'professional', 'other'],
  COMMUNITY_STATUS: { PENDING: 'pending', ACTIVE: 'active', SUSPENDED: 'suspended' },

  // Membership
  MEMBERSHIP_ROLES: { MEMBER: 'member', MODERATOR: 'moderator' },
  MEMBERSHIP_STATUS: { ACTIVE: 'active', BANNED: 'banned' },

  // Posts
  POST_TYPES: ['post', 'announcement', 'question', 'alert', 'event_share'],
  POST_VISIBILITY: { PUBLIC: 'public', MEMBERS: 'members', MODERATORS: 'moderators' },

  // Events
  EVENT_STATUS: { UPCOMING: 'upcoming', ONGOING: 'ongoing', COMPLETED: 'completed', CANCELLED: 'cancelled' },
  EVENT_CATEGORIES: ['social', 'cultural', 'sports', 'education', 'health', 'business', 'other'],
  ATTENDEE_STATUS: { GOING: 'going', INTERESTED: 'interested', NOT_GOING: 'not_going' },

  // Notifications
  NOTIFICATION_TYPES: [
    'community_join', 'community_approved', 'post_like', 'post_comment',
    'event_reminder', 'new_member', 'announcement', 'mention',
  ],

  // Limits
  MAX_BIO_LENGTH: 500,
  MAX_POST_LENGTH: 5000,
  MAX_COMMUNITY_NAME: 100,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};
