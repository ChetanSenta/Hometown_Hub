const router = require('express').Router();
const { adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/admin');

router.get('/stats', adminOnly, ctrl.getStats);
router.get('/users', adminOnly, ctrl.getUsers);
router.put('/users/:id/ban', adminOnly, ctrl.banUser);
router.put('/users/:id/role', adminOnly, ctrl.setRole);
router.get('/communities', adminOnly, ctrl.getCommunities);
router.put('/communities/:id/status', adminOnly, ctrl.setCommunityStatus);
router.get('/flagged-posts', adminOnly, ctrl.getFlaggedPosts);
router.delete('/posts/:id', adminOnly, ctrl.adminDeletePost);

module.exports = router;
