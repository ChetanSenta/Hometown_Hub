const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/post');

router.get('/feed', protect, ctrl.getFeed);
router.get('/', optionalAuth, ctrl.getPosts);
router.get('/:id', optionalAuth, ctrl.getPost);
router.post('/', protect, ctrl.createPost);
router.put('/:id', protect, ctrl.updatePost);
router.delete('/:id', protect, ctrl.deletePost);
router.post('/:id/like', protect, ctrl.likePost);
router.put('/:id/pin', protect, ctrl.pinPost);

module.exports = router;
