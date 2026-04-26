const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/community');

router.get('/', optionalAuth, ctrl.getCommunities);
router.get('/my', protect, ctrl.myCommunities);
router.get('/:id', optionalAuth, ctrl.getCommunity);
router.post('/', protect, ctrl.createCommunity);
router.put('/:id', protect, ctrl.updateCommunity);
router.post('/:id/join', protect, ctrl.joinCommunity);
router.delete('/:id/leave', protect, ctrl.leaveCommunity);
router.get('/:id/members', optionalAuth, ctrl.getMembers);

module.exports = router;
