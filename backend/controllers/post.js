const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/paginate');

// GET /api/posts?community_id=&type=&page=
async function getPosts(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { community_id, type } = req.query;

    let where = [`p.is_deleted = false`];
    const params = [];
    let pi = 1;

    if (community_id) { where.push(`p.community_id = $${pi}`); params.push(community_id); pi++; }
    if (type) { where.push(`p.type = $${pi}`); params.push(type); pi++; }

    const whereStr = 'WHERE ' + where.join(' AND ');

    const countResult = await pool.query(`SELECT COUNT(*) FROM posts p ${whereStr}`, params);
    const total = countResult.rows[0].count;

    const { rows } = await pool.query(
      `SELECT p.*,
              u.name as author_name, u.avatar as author_avatar, u.hometown as author_hometown,
              c.name as community_name, c.emoji as community_emoji
       FROM posts p
       JOIN users u ON p.author_id = u.id
       JOIN communities c ON p.community_id = c.id
       ${whereStr}
       ORDER BY p.is_pinned DESC, p.created_at DESC
       LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]
    );

    // If user logged in, attach liked status
    if (req.user) {
      const postIds = rows.map(r => r.id);
      if (postIds.length) {
        const { rows: liked } = await pool.query(
          `SELECT post_id FROM post_likes WHERE user_id = $1 AND post_id = ANY($2)`,
          [req.user.id, postIds]
        );
        const likedSet = new Set(liked.map(l => l.post_id));
        rows.forEach(r => { r.liked_by_me = likedSet.has(r.id); });
      }
    }

    res.json({ success: true, ...paginatedResponse(rows, total, page, limit) });
  } catch (err) { next(err); }
}

// GET /api/posts/:id
async function getPost(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar,
              c.name as community_name, c.emoji as community_emoji
       FROM posts p
       JOIN users u ON p.author_id = u.id
       JOIN communities c ON p.community_id = c.id
       WHERE p.id = $1 AND p.is_deleted = false`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/posts
async function createPost(req, res, next) {
  try {
    const { community_id, type, title, content, visibility, tags } = req.body;

    // Must be community member
    const { rows: mem } = await pool.query(
      `SELECT 1 FROM memberships WHERE user_id=$1 AND community_id=$2 AND status='active'`,
      [req.user.id, community_id]
    );
    if (!mem.length) return res.status(403).json({ success: false, message: 'Join the community to post' });

    const { rows } = await pool.query(
      `INSERT INTO posts (author_id, community_id, type, title, content, visibility, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, community_id, type || 'post', title || null, content, visibility || 'members', JSON.stringify(tags || [])]
    );
    res.status(201).json({ success: true, post: rows[0] });
  } catch (err) { next(err); }
}

// PUT /api/posts/:id
async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const { rows: existing } = await pool.query(`SELECT * FROM posts WHERE id=$1`, [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Post not found' });
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { rows } = await pool.query(
      `UPDATE posts SET title=$1, content=$2, tags=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [title, content, JSON.stringify(tags || []), id]
    );
    res.json({ success: true, post: rows[0] });
  } catch (err) { next(err); }
}

// DELETE /api/posts/:id
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: existing } = await pool.query(`SELECT author_id, community_id FROM posts WHERE id=$1`, [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Post not found' });
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pool.query(`UPDATE posts SET is_deleted=true, updated_at=NOW() WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
}

// POST /api/posts/:id/like
async function likePost(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2`, [id, req.user.id]
    );
    if (existing.length) {
      // Unlike
      await pool.query(`DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2`, [id, req.user.id]);
      await pool.query(`UPDATE posts SET like_count = GREATEST(like_count-1,0) WHERE id=$1`, [id]);
      return res.json({ success: true, liked: false });
    }
    await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1,$2)`, [id, req.user.id]);
    await pool.query(`UPDATE posts SET like_count = like_count+1 WHERE id=$1`, [id]);
    res.json({ success: true, liked: true });
  } catch (err) { next(err); }
}

// PUT /api/posts/:id/pin
async function pinPost(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`SELECT community_id, is_pinned FROM posts WHERE id=$1`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found' });
    const { rows: mem } = await pool.query(
      `SELECT role FROM memberships WHERE user_id=$1 AND community_id=$2`, [req.user.id, rows[0].community_id]
    );
    if (!mem.length || mem[0].role !== 'moderator') {
      return res.status(403).json({ success: false, message: 'Moderator access required' });
    }
    const newPinned = !rows[0].is_pinned;
    await pool.query(`UPDATE posts SET is_pinned=$1, updated_at=NOW() WHERE id=$2`, [newPinned, id]);
    res.json({ success: true, is_pinned: newPinned });
  } catch (err) { next(err); }
}

// GET /api/posts/feed (posts from user's communities)
async function getFeed(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts p
       JOIN memberships m ON p.community_id = m.community_id
       WHERE m.user_id=$1 AND p.is_deleted=false`,
      [req.user.id]
    );
    const { rows } = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar,
              c.name as community_name, c.emoji as community_emoji
       FROM posts p
       JOIN memberships m ON p.community_id = m.community_id
       JOIN users u ON p.author_id = u.id
       JOIN communities c ON p.community_id = c.id
       WHERE m.user_id=$1 AND p.is_deleted=false
       ORDER BY p.is_pinned DESC, p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ success: true, ...paginatedResponse(rows, countResult.rows[0].count, page, limit) });
  } catch (err) { next(err); }
}

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, likePost, pinPost, getFeed };
