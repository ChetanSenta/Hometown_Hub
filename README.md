# Hometown Hub — Digital Community Platform

A full-stack web app for connecting people with their hometown communities.
Built with **React 18**, **Node.js/Express**, and **PostgreSQL**.

---

## Quick Start

Run these commands **in order**:

```bash
# Step 1 — Install all dependencies (root + backend + frontend)
npm run setup

# Step 2 — Seed the PostgreSQL database (creates tables + sample data)
npm run seed

# Step 3 — Run both frontend and backend together
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:5001/api  
- **Health check**: http://localhost:5001/api/health

> **Note**: Make sure PostgreSQL is running on port 5432 before seeding.

---

## Prerequisites

- Node.js 16+
- PostgreSQL running locally with these credentials (edit `backend/.env` to change):

```
DB_USER=postgres
DB_PASSWORD=1607
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Hometown Hub
```

---

## Demo Credentials

| Role  | Email                     | Password    |
|-------|---------------------------|-------------|
| Admin | admin@hometownhub.com     | admin123    |
| User  | priya@example.com         | password123 |

---

## Docker (One Command)

```bash
docker-compose up --build
```

---

## Project Structure

```
hometown-hub/
├── package.json               ← Root: run setup / dev / seed from here
├── backend/
│   ├── server.js
│   ├── .env                   ← DB + JWT config
│   ├── config/                ← db.js (PostgreSQL pool) + constants.js
│   ├── controllers/           ← auth, community, post, event, notification, admin
│   ├── routes/                ← 6 Express routers
│   ├── middleware/            ← auth.js, errorHandler.js, validate.js
│   ├── utils/                 ← jwt.js, paginate.js
│   └── scripts/seed.js        ← Full DB reset + sample data
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/           ← AuthContext, ToastContext
        ├── hooks/             ← useCommunities, usePosts, useEvents, useNotifications
        ├── components/        ← layout, shared, community, posts, events
        └── pages/             ← auth, Feed, Communities, Events, Notifications, Profile, Admin
```

---

## Available Scripts (from project root)

| Command           | What it does                                      |
|-------------------|---------------------------------------------------|
| `npm run setup`   | Installs all dependencies (root + backend + frontend) |
| `npm run seed`    | Creates DB tables and inserts sample data         |
| `npm run dev`     | Starts both backend (port 5001) and frontend (port 3000) |

