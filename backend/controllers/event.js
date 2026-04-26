const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/paginate');

// GET /api/events
async function getEvents(req, res, next) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { community_id, category, status } = req.query;

    let where = [`e.status != 'cancelled'`];
    const params = [];
    let pi = 1;

    if (community_id) { where.push(`e.community_id = $${pi}`); params.push(community_id); pi++; }
    if (category) { where.push(`e.category = $${pi}`); params.push(category); pi++; }
    if (status) { where.push(`e.status = $${pi}`); params.push(status); pi++; }

    const whereStr = 'WHERE ' + where.join(' AND ');
    const countResult = await pool.query(`SELECT COUNT(*) FROM events e ${whereStr}`, params);

    const { rows } = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.avatar as organizer_avatar,
              c.name as community_name, c.emoji as community_emoji
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       JOIN communities c ON e.community_id = c.id
       ${whereStr}
       ORDER BY e.start_date ASC
       LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]
    );

    if (req.user) {
      const eventIds = rows.map(r => r.id);
      if (eventIds.length) {
        const { rows: att } = await pool.query(
          `SELECT event_id, status FROM event_attendees WHERE user_id=$1 AND event_id=ANY($2)`,
          [req.user.id, eventIds]
        );
        const attMap = {};
        att.forEach(a => { attMap[a.event_id] = a.status; });
        rows.forEach(r => { r.my_attendance = attMap[r.id] || null; });
      }
    }

    res.json({ success: true, ...paginatedResponse(rows, countResult.rows[0].count, page, limit) });
  } catch (err) { next(err); }
}

// GET /api/events/:id
async function getEvent(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.avatar as organizer_avatar,
              c.name as community_name, c.emoji as community_emoji
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       JOIN communities c ON e.community_id = c.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/events
async function createEvent(req, res, next) {
  try {
    const {
      title, description, community_id, category,
      start_date, end_date, location_address, location_city,
      is_online, online_link, max_attendees, is_public
    } = req.body;

    const { rows: mem } = await pool.query(
      `SELECT 1 FROM memberships WHERE user_id=$1 AND community_id=$2 AND status='active'`,
      [req.user.id, community_id]
    );
    if (!mem.length) return res.status(403).json({ success: false, message: 'Must be community member' });

    const { rows } = await pool.query(
      `INSERT INTO events (title, description, community_id, organizer_id, category, start_date, end_date,
        location_address, location_city, is_online, online_link, max_attendees, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [title, description, community_id, req.user.id, category || 'social',
       start_date, end_date, location_address || null, location_city || null,
       is_online || false, online_link || null, max_attendees || 0, is_public !== false]
    );
    res.status(201).json({ success: true, event: rows[0] });
  } catch (err) { next(err); }
}

// PUT /api/events/:id
async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: ev } = await pool.query(`SELECT organizer_id FROM events WHERE id=$1`, [id]);
    if (!ev.length) return res.status(404).json({ success: false, message: 'Event not found' });
    if (ev[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { title, description, category, start_date, end_date, location_address, location_city, is_online, online_link, max_attendees, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE events SET title=$1, description=$2, category=$3, start_date=$4, end_date=$5,
       location_address=$6, location_city=$7, is_online=$8, online_link=$9, max_attendees=$10, status=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [title, description, category, start_date, end_date, location_address, location_city, is_online, online_link, max_attendees, status, id]
    );
    res.json({ success: true, event: rows[0] });
  } catch (err) { next(err); }
}

// DELETE /api/events/:id
async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: ev } = await pool.query(`SELECT organizer_id FROM events WHERE id=$1`, [id]);
    if (!ev.length) return res.status(404).json({ success: false, message: 'Event not found' });
    if (ev[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pool.query(`UPDATE events SET status='cancelled', updated_at=NOW() WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Event cancelled' });
  } catch (err) { next(err); }
}

// POST /api/events/:id/attend
async function attendEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'going' | 'interested' | 'not_going'
    const { rows: ev } = await pool.query(`SELECT max_attendees, attendee_count FROM events WHERE id=$1`, [id]);
    if (!ev.length) return res.status(404).json({ success: false, message: 'Event not found' });
    if (ev[0].max_attendees > 0 && ev[0].attendee_count >= ev[0].max_attendees && status === 'going') {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    const attendStatus = status || 'going';
    await pool.query(
      `INSERT INTO event_attendees (event_id, user_id, status)
       VALUES ($1,$2,$3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status=$3`,
      [id, req.user.id, attendStatus]
    );
    if (attendStatus === 'going') {
      await pool.query(`UPDATE events SET attendee_count = attendee_count + 1 WHERE id=$1`, [id]);
    }
    res.json({ success: true, status: attendStatus });
  } catch (err) { next(err); }
}

// GET /api/events/:id/attendees
async function getAttendees(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.avatar, ea.status, ea.registered_at
       FROM event_attendees ea JOIN users u ON ea.user_id = u.id
       WHERE ea.event_id=$1 ORDER BY ea.registered_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, attendees: rows });
  } catch (err) { next(err); }
}

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, attendEvent, getAttendees };
