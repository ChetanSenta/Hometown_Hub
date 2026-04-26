# Deployment Guide — Render (Backend) + Vercel (Frontend)

---

## PART 1 — Deploy Backend + Database on Render

### Step 1 — Push code to GitHub

```bash
cd hometown-hub
git init
git add .
git commit -m "initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/hometown-hub.git
git push -u origin main
```

### Step 2 — Create PostgreSQL database on Render

1. Go to https://render.com and sign up / log in
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - Name: `hometown-hub-db`
   - Region: Oregon (or closest to you)
   - Plan: **Free**
4. Click **Create Database**
5. Wait ~1 minute for it to be ready
6. Click on the database → copy the **Internal Database URL**
   It looks like: `postgresql://user:password@host/dbname`

### Step 3 — Create Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Fill in:
   - Name: `hometown-hub-api`
   - Root Directory: `backend`
   - Environment: **Node**
   - Region: **same as your database**
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: **Free**

4. Click **Advanced** → **Add Environment Variables**:

| Key           | Value                                      |
|---------------|--------------------------------------------|
| NODE_ENV      | production                                 |
| JWT_SECRET    | any_long_random_string_min_32_chars        |
| CLIENT_URL    | (leave blank for now, fill after Vercel deploy) |

5. Scroll down → **Add from Database** → select `hometown-hub-db`
   This auto-fills: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

6. Click **Create Web Service**

7. Wait for deploy — green "Live" status (takes 2-5 min)

8. Copy your backend URL:
   `https://hometown-hub-api.onrender.com`

### Step 4 — Run the seed script on Render

1. In Render → your web service → **Shell** tab
2. Run:
```bash
node scripts/seed.js
```
3. You should see: "Database seeded successfully!"

---

## PART 2 — Deploy Frontend on Vercel

### Step 1 — Deploy to Vercel

1. Go to https://vercel.com and sign up / log in
2. Click **New Project** → Import your GitHub repo
3. Fill in:
   - Framework Preset: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)

4. **Environment Variables** — Add this:

| Key                  | Value                                              |
|----------------------|----------------------------------------------------|
| REACT_APP_API_URL    | https://hometown-hub-api.onrender.com/api          |

   Replace `hometown-hub-api` with your actual Render service name.

5. Click **Deploy**

6. Copy your Vercel URL: `https://hometown-hub-xyz.vercel.app`

### Step 2 — Update CORS on Render backend

1. Go to Render → your web service → **Environment**
2. Add:

| Key        | Value                                    |
|------------|------------------------------------------|
| CLIENT_URL | https://hometown-hub-xyz.vercel.app      |

3. Click **Save Changes** → Render auto-redeploys

---

## Done! Test your app

Visit your Vercel URL and log in with:
- **Admin**: admin@hometownhub.com / admin123
- **User**: priya@example.com / password123

---

## Troubleshooting

### Login gives 405 or network error
- Make sure `REACT_APP_API_URL` is set in Vercel env vars
- Make sure it points to `https://your-render-url/api` (with `/api` at end)
- Redeploy frontend after adding env var

### CORS error in browser console
- Make sure `CLIENT_URL` is set in Render env vars
- Must exactly match your Vercel URL (no trailing slash)

### Database connection error
- Check all DB_ env vars are set in Render
- Make sure you linked the Render PostgreSQL database to the web service

### Render service sleeps after 15 minutes (free tier)
- Free tier spins down after inactivity — first request takes ~30 seconds
- Upgrade to paid plan to avoid this, or use a cron service to ping /api/health

---

## Local Development

No changes needed locally — the proxy in frontend/package.json
forwards /api requests to localhost:5001 automatically.

```bash
npm run setup    # install all dependencies
npm run seed     # seed local PostgreSQL
npm run dev      # start both servers
```

