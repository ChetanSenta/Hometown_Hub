const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_banned FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });
    if (rows[0].is_banned) return res.status(403).json({ success: false, message: 'Account is banned' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

async function adminOnly(req, res, next) {
  await protect(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const decoded = verifyToken(header.split(' ')[1]);
      const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (rows.length) req.user = rows[0];
    }
  } catch (_) {}
  next();
}

module.exports = { protect, adminOnly, optionalAuth };
