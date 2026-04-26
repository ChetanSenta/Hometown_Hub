const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/paginate');

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [users, communities, posts, events] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users`),
      pool.query(`SELECT COUNT(*) FROM communities WHERE status='active'`),
      pool.query(`SELECT COUNT(*) FROM posts WHERE is_deleted=false`),
      pool.query(`SELECT COUNT(*) FROM events`),
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        activeCommunities: parseInt(communities.rows[0].count),
        totalPosts: parseInt(posts.rows[0].count),
        totalEvents: parseInt(events.rows[0].count),
      }
    });
  } catch (err) { next(err); }
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { search } = req.query;
    let where = '';
    const params = [];
    if (search) { where = `WHERE name ILIKE $1 OR email ILIKE $1`; params.push(`%${search}%`); }
    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const pi = params.length + 1;
    const { rows } = await pool.query(
      `SELECT id, name, email, role, is_verified, is_banned, hometown, current_city, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]
    );
    res.json({ success: true, ...paginatedResponse(rows, countResult.rows[0].count, page, limit) });
  } catch (err) { next(err); }
}

// PUT /api/admin/users/:id/ban
async function banUser(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`SELECT is_banned FROM users WHERE id=$1`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    const newBanStatus = !rows[0].is_banned;
    await pool.query(`UPDATE users SET is_banned=$1, updated_at=NOW() WHERE id=$2`, [newBanStatus, id]);
    res.json({ success: true, is_banned: newBanStatus });
  } catch (err) { next(err); }
}

// PUT /api/admin/users/:id/role
async function setRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    await pool.query(`UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2`, [role, req.params.id]);
    res.json({ success: true, message: 'Role updated' });
  } catch (err) { next(err); }
}

// GET /api/admin/communities
async function getCommunities(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const countResult = await pool.query(`SELECT COUNT(*) FROM communities`);
    const { rows } = await pool.query(
      `SELECT c.*, u.name as creator_name
       FROM communities c JOIN users u ON c.creator_id=u.id
       ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, ...paginatedResponse(rows, countResult.rows[0].count, page, limit) });
  } catch (err) { next(err); }
}

// PUT /api/admin/communities/:id/status
async function setCommunityStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await pool.query(`UPDATE communities SET status=$1, updated_at=NOW() WHERE id=$2`, [status, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) { next(err); }
}

// GET /api/admin/flagged-posts
async function getFlaggedPosts(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name as author_name, c.name as community_name
       FROM posts p JOIN users u ON p.author_id=u.id JOIN communities c ON p.community_id=c.id
       WHERE p.is_flagged=true AND p.is_deleted=false ORDER BY p.created_at DESC`
    );
    res.json({ success: true, posts: rows });
  } catch (err) { next(err); }
}

// DELETE /api/admin/posts/:id
async function adminDeletePost(req, res, next) {
  try {
    await pool.query(`UPDATE posts SET is_deleted=true, updated_at=NOW() WHERE id=$1`, [req.params.id]);
    res.json({ success: true, message: 'Post removed' });
  } catch (err) { next(err); }
}

module.exports = { getStats, getUsers, banUser, setRole, getCommunities, setCommunityStatus, getFlaggedPosts, adminDeletePost };
