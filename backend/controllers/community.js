const { pool } = require('../config/db');
const slugify = require('slugify');
const { paginate, paginatedResponse } = require('../utils/paginate');

// GET /api/communities
async function getCommunities(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { search, category, city } = req.query;

    let where = [`c.status = 'active'`];
    const params = [];
    let pi = 1;

    if (search) { where.push(`(c.name ILIKE $${pi} OR c.description ILIKE $${pi})`); params.push(`%${search}%`); pi++; }
    if (category) { where.push(`c.category = $${pi}`); params.push(category); pi++; }
    if (city) { where.push(`c.city ILIKE $${pi}`); params.push(`%${city}%`); pi++; }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM communities c ${whereStr}`, params);
    const total = countResult.rows[0].count;

    const { rows } = await pool.query(
      `SELECT c.*, u.name as creator_name, u.avatar as creator_avatar
       FROM communities c
       JOIN users u ON c.creator_id = u.id
       ${whereStr}
       ORDER BY c.member_count DESC
       LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]
    );

    res.json({ success: true, ...paginatedResponse(rows, total, page, limit) });
  } catch (err) { next(err); }
}

// GET /api/communities/:id
async function getCommunity(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT c.*, u.name as creator_name, u.avatar as creator_avatar
       FROM communities c JOIN users u ON c.creator_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Community not found' });
    res.json({ success: true, community: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/communities
async function createCommunity(req, res, next) {
  try {
    const { name, description, city, village, state, country, category, emoji, is_private, requires_approval } = req.body;
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO communities (name, slug, description, city, village, state, country, category, emoji, is_private, requires_approval, creator_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active')
       RETURNING *`,
      [name, slug, description, city, village || null, state || null, country || 'India', category || 'city', emoji || '🏘️', is_private || false, requires_approval || false, req.user.id]
    );
    // Auto-join creator as moderator
    await pool.query(
      `INSERT INTO memberships (user_id, community_id, role) VALUES ($1, $2, 'moderator')`,
      [req.user.id, rows[0].id]
    );
    await pool.query(`UPDATE communities SET member_count = 1 WHERE id = $1`, [rows[0].id]);
    res.status(201).json({ success: true, community: rows[0] });
  } catch (err) { next(err); }
}

// PUT /api/communities/:id
async function updateCommunity(req, res, next) {
  try {
    const { id } = req.params;
    const { description, cover_image, emoji, is_private, requires_approval } = req.body;
    // Check moderator
    const { rows: mem } = await pool.query(
      `SELECT role FROM memberships WHERE community_id=$1 AND user_id=$2`,
      [id, req.user.id]
    );
    if (!mem.length || (mem[0].role !== 'moderator' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { rows } = await pool.query(
      `UPDATE communities SET description=$1, cover_image=$2, emoji=$3, is_private=$4, requires_approval=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [description, cover_image || '', emoji, is_private, requires_approval, id]
    );
    res.json({ success: true, community: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/communities/:id/join
async function joinCommunity(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: exists } = await pool.query(
      `SELECT 1 FROM memberships WHERE user_id=$1 AND community_id=$2`, [req.user.id, id]
    );
    if (exists.length) return res.status(409).json({ success: false, message: 'Already a member' });

    await pool.query(
      `INSERT INTO memberships (user_id, community_id, role) VALUES ($1, $2, 'member')`,
      [req.user.id, id]
    );
    await pool.query(`UPDATE communities SET member_count = member_count + 1 WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Joined community' });
  } catch (err) { next(err); }
}

// DELETE /api/communities/:id/leave
async function leaveCommunity(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      `DELETE FROM memberships WHERE user_id=$1 AND community_id=$2`, [req.user.id, id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Not a member' });
    await pool.query(`UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Left community' });
  } catch (err) { next(err); }
}

// GET /api/communities/:id/members
async function getMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.avatar, u.hometown, m.role, m.joined_at
       FROM memberships m JOIN users u ON m.user_id = u.id
       WHERE m.community_id = $1 ORDER BY m.joined_at ASC`,
      [id]
    );
    res.json({ success: true, members: rows });
  } catch (err) { next(err); }
}

// GET /api/communities/my
async function myCommunities(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, m.role as my_role
       FROM communities c JOIN memberships m ON c.id = m.community_id
       WHERE m.user_id = $1 AND c.status = 'active'
       ORDER BY c.name`,
      [req.user.id]
    );
    res.json({ success: true, communities: rows });
  } catch (err) { next(err); }
}

module.exports = { getCommunities, getCommunity, createCommunity, updateCommunity, joinCommunity, leaveCommunity, getMembers, myCommunities };
