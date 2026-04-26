require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes         = require('./routes/auth');
const communityRoutes    = require('./routes/community');
const postRoutes         = require('./routes/post');
const eventRoutes        = require('./routes/event');
const notificationRoutes = require('./routes/notification');
const adminRoutes        = require('./routes/admin');

const app = express();

// Build list of allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (Postman, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow all in development
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — Render pings this to keep service alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hometown Hub API is running', env: process.env.NODE_ENV });
});

app.use('/api/auth',          authRoutes);
app.use('/api/communities',   communityRoutes);
app.use('/api/posts',         postRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function startServer() {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ') || 'all (dev mode)'}`);
  });
}

startServer();
