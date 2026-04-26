const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/event');

router.get('/', optionalAuth, ctrl.getEvents);
router.get('/:id', optionalAuth, ctrl.getEvent);
router.post('/', protect, ctrl.createEvent);
router.put('/:id', protect, ctrl.updateEvent);
router.delete('/:id', protect, ctrl.deleteEvent);
router.post('/:id/attend', protect, ctrl.attendEvent);
router.get('/:id/attendees', optionalAuth, ctrl.getAttendees);

module.exports = router;
