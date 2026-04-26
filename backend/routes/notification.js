const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notification');

router.get('/', protect, ctrl.getNotifications);
router.get('/unread-count', protect, ctrl.getUnreadCount);
router.put('/read-all', protect, ctrl.markAllRead);
router.put('/:id/read', protect, ctrl.markRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
