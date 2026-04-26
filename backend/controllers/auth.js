const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { signToken } = require('../utils/jwt');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, hometown, current_city, bio } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, hometown, current_city, bio)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, avatar, hometown, current_city, bio, created_at`,
      [name, email, hashed, hometown || null, current_city || null, bio || null]
    );
    const user = rows[0];
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = rows[0];
    if (user.is_banned) return res.status(403).json({ success: false, message: 'Account is banned' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await pool.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);
    const token = signToken({ id: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, avatar, bio, hometown, current_city, role, is_verified, last_seen, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, bio, hometown, current_city, avatar } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name=$1, bio=$2, hometown=$3, current_city=$4, avatar=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING id, name, email, avatar, bio, hometown, current_city, role`,
      [name, bio, hometown, current_city, avatar || '', req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateProfile, changePassword };
