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
const seedRoute          = require('./routes/seed');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hometown Hub API is running' });
});

app.use('/api/run-seed', seedRoute);
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
  });
}

startServer();
