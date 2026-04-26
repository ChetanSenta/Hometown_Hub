const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/paginate');

// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE recipient_id=$1`, [req.user.id]
    );
    const { rows } = await pool.query(
      `SELECT n.*, u.name as sender_name, u.avatar as sender_avatar
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id=$1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ success: true, ...paginatedResponse(rows, countResult.rows[0].count, page, limit) });
  } catch (err) { next(err); }
}

// GET /api/notifications/unread-count
async function getUnreadCount(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE recipient_id=$1 AND is_read=false`,
      [req.user.id]
    );
    res.json({ success: true, count: parseInt(rows[0].count) });
  } catch (err) { next(err); }
}

// PUT /api/notifications/:id/read
async function markRead(req, res, next) {
  try {
    await pool.query(
      `UPDATE notifications SET is_read=true WHERE id=$1 AND recipient_id=$2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
}

// PUT /api/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await pool.query(
      `UPDATE notifications SET is_read=true WHERE recipient_id=$1`,
      [req.user.id]
    );
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) { next(err); }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    await pool.query(
      `DELETE FROM notifications WHERE id=$1 AND recipient_id=$2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
}

// Helper to create a notification (used internally by other controllers)
async function createNotification({ recipient_id, sender_id, type, message, link, community_id, post_id, event_id }) {
  if (recipient_id === sender_id) return; // Don't notify yourself
  await pool.query(
    `INSERT INTO notifications (recipient_id, sender_id, type, message, link, community_id, post_id, event_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [recipient_id, sender_id || null, type, message, link || null, community_id || null, post_id || null, event_id || null]
  );
}

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification, createNotification };
