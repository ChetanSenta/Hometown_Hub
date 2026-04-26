# 🏘️ Hometown Hub - Digital Community Platform

A full-stack web application that connects people with their hometown communities, enabling local networking, event organization, and cultural preservation.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

## 🌐 Live Demo

**Application**: [https://hometown-hub-6q6p.vercel.app](https://hometown-hub-6q6p.vercel.app)

| Role  | Email                     | Password    |
|-------|---------------------------|-------------|
| Admin | admin@hometownhub.com     | admin123    |
| User  | priya@example.com         | password123 |

---

## 🌟 Features

### 🌆 Community Management
- **Create & Join Communities**: City, village, district, cultural, or professional groups
- **Member Roles**: Moderator controls — approve members, pin posts, manage content
- **Community Discovery**: Search and filter by city, state, or category
- **Member Directory**: View all members with roles and hometown details

### 📝 Posts & Announcements
- **Multiple Post Types**: Posts, announcements, questions, and alerts
- **Like & Engagement**: Like/unlike with real-time count updates
- **Pin Important Posts**: Moderators pin key announcements to top of feed
- **Personalized Feed**: Posts only from your joined communities
- **Tag System**: Categorize posts with custom tags

### 🎉 Event Management
- **Create Local Events**: Cultural, social, sports, education, and business events
- **RSVP System**: Going / Interested / Not Going attendance tracking
- **Online & Offline**: Support for virtual and in-person events
- **Capacity Control**: Set max attendees with full-house detection

### 🔔 Notifications
- **Real-Time Unread Badge**: Live count updates in navbar every 30 seconds
- **Notification Types**: Community joins, post likes, event reminders, announcements
- **Mark as Read**: Individual and bulk read-all actions

### 👤 User Profiles
- **Rich Profile**: Name, bio, hometown, and current city
- **Gradient Avatars**: Auto-generated color avatars with initials
- **Security Tab**: Password change with confirmation validation

### ⚙️ Admin Dashboard
- **Platform Statistics**: Live counts of users, communities, posts, events
- **User Management**: Ban/unban users, promote to admin
- **Community Moderation**: Activate or suspend communities
- **Flagged Content**: Review and remove reported posts

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** — Hooks, context, functional components
- **React Router DOM 6** — Protected and guest routes
- **Lucide React** — Consistent icon library
- **Axios** — HTTP client with interceptors
- **date-fns** — Date formatting and time-ago
- **Sora + DM Sans** — Google Fonts typography

### Backend
- **Node.js 18+** — JavaScript runtime
- **Express.js 4.18** — Web framework
- **bcryptjs** — Password hashing (12 salt rounds)
- **jsonwebtoken** — JWT authentication (7-day expiry)
- **express-validator** — Input validation
- **cors** — Cross-origin resource sharing

### Database
- **PostgreSQL 15** — 8 relational tables
- **pg (node-postgres)** — Connection pooling
- **uuid-ossp** — UUID primary key generation
- **JSONB** — Flexible tag storage

### Deployment
- **Vercel** — Frontend hosting
- **Render** — Backend Node.js service
- **Render PostgreSQL** — Managed cloud database

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 15
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/ChetanSenta/Hometown_Hub.git
cd Hometown_Hub
```

**2. Install all dependencies**
```bash
npm run setup
```

**3. Create `backend/.env`**
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hometown_hub
JWT_SECRET=your_secret_key
PORT=5001
NODE_ENV=development
```

**4. Seed the database**
```bash
npm run seed
```

**5. Start the application**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api

---

## 📁 Project Structure

```
Hometown_Hub/
├── package.json                 ← Root scripts (setup / dev / seed)
├── backend/
│   ├── server.js                ← Entry point
│   ├── config/
│   │   ├── db.js                ← PostgreSQL pool
│   │   └── constants.js         ← Enums and limits
│   ├── controllers/             ← Business logic
│   │   ├── auth.js
│   │   ├── community.js
│   │   ├── post.js
│   │   ├── event.js
│   │   ├── notification.js
│   │   └── admin.js
│   ├── routes/                  ← Express routers
│   ├── middleware/
│   │   ├── auth.js              ← protect / adminOnly / optionalAuth
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── paginate.js
│   └── scripts/seed.js          ← DB reset + sample data
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/             ← AuthContext, ToastContext
        ├── hooks/               ← useCommunities, usePosts, useEvents, useNotifications
        ├── utils/               ← api.js, helpers.js
        ├── components/
        │   ├── layout/          ← Navbar, Sidebar, AppLayout
        │   ├── shared/          ← Avatar, Spinner, EmptyState, Modal
        │   ├── community/       ← CommunityCard
        │   ├── posts/           ← PostCard, CreatePostForm
        │   └── events/          ← EventCard
        └── pages/
            ├── auth/            ← LoginPage, RegisterPage
            ├── FeedPage.jsx
            ├── CommunitiesPage.jsx
            ├── CommunityDetailPage.jsx
            ├── EventsPage.jsx
            ├── NotificationsPage.jsx
            ├── ProfilePage.jsx
            └── AdminPage.jsx
```

---

## 🗄️ Database Schema

| Table             | Description                             |
|-------------------|-----------------------------------------|
| `users`           | Accounts with role and profile          |
| `communities`     | City/village groups with category       |
| `memberships`     | User-community join with roles          |
| `posts`           | Posts with types, tags, soft-delete     |
| `post_likes`      | Many-to-many post likes                 |
| `events`          | Events with RSVP and capacity           |
| `event_attendees` | Attendance with status                  |
| `notifications`   | In-app notifications                    |

---

## 📡 API Reference

### Auth
| Method | Endpoint                  | Auth     |
|--------|---------------------------|----------|
| POST   | /api/auth/register        | Public   |
| POST   | /api/auth/login           | Public   |
| GET    | /api/auth/me              | Required |
| PUT    | /api/auth/profile         | Required |
| PUT    | /api/auth/change-password | Required |

### Communities
| Method | Endpoint                       | Auth      |
|--------|--------------------------------|-----------|
| GET    | /api/communities               | Optional  |
| GET    | /api/communities/my            | Required  |
| POST   | /api/communities               | Required  |
| POST   | /api/communities/:id/join      | Required  |
| DELETE | /api/communities/:id/leave     | Required  |
| GET    | /api/communities/:id/members   | Optional  |

### Posts
| Method | Endpoint              | Auth      |
|--------|-----------------------|-----------|
| GET    | /api/posts/feed       | Required  |
| GET    | /api/posts            | Optional  |
| POST   | /api/posts            | Required  |
| DELETE | /api/posts/:id        | Required  |
| POST   | /api/posts/:id/like   | Required  |
| PUT    | /api/posts/:id/pin    | Moderator |

### Events
| Method | Endpoint                  | Auth     |
|--------|---------------------------|----------|
| GET    | /api/events               | Optional |
| POST   | /api/events               | Required |
| POST   | /api/events/:id/attend    | Required |
| GET    | /api/events/:id/attendees | Optional |

### Notifications
| Method | Endpoint                        | Auth     |
|--------|---------------------------------|----------|
| GET    | /api/notifications              | Required |
| GET    | /api/notifications/unread-count | Required |
| PUT    | /api/notifications/read-all     | Required |
| DELETE | /api/notifications/:id          | Required |

### Admin
| Method | Endpoint                          | Auth  |
|--------|-----------------------------------|-------|
| GET    | /api/admin/stats                  | Admin |
| GET    | /api/admin/users                  | Admin |
| PUT    | /api/admin/users/:id/ban          | Admin |
| GET    | /api/admin/communities            | Admin |
| PUT    | /api/admin/communities/:id/status | Admin |
| GET    | /api/admin/flagged-posts          | Admin |

---

## 🔒 Security

- **JWT Authentication** — Signed tokens with 7-day expiry
- **Password Hashing** — bcryptjs with 12 salt rounds
- **Role Guards** — protect / adminOnly / optionalAuth middleware
- **CORS Whitelist** — Only registered origins allowed in production
- **Parameterized Queries** — No SQL injection possible
- **Input Validation** — express-validator on all routes

---

## 🚀 Deployment

### Frontend — Vercel
1. Import repo → Root Directory: `frontend`
2. Add env var: `REACT_APP_API_URL=https://hometown-hub-api.onrender.com/api`
3. Deploy

### Backend — Render
1. Create PostgreSQL database on Render
2. Create Web Service → Root Directory: `backend`
3. Build: `npm install` | Start: `node server.js`
4. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
5. Deploy

---

## 🔄 Version History

- **v1.0.0** — Full production launch with all features
- **v0.9.0** — Render + Vercel deployment, CORS and DATABASE_URL fixes
- **v0.8.0** — Lucide icons, emoji removal, UI polish
- **v0.7.0** — PostgreSQL migration and seed script

---

## 🎯 Future Enhancements

- Real-time chat with WebSockets
- Image uploads for posts and avatars
- Comment system on posts
- Mobile app (React Native)
- PWA with push notifications
- Multi-language support (Hindi and regional languages)

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request


---

*Built to reconnect people with their roots — no matter where life takes them.*