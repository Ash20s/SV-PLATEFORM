const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const postController = require('../controllers/postController');

// Post routes
router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
router.get('/user/:userId', postController.getUserPosts);
router.get('/team/:teamId', postController.getTeamPosts);
router.post('/:postId/like', authMiddleware, postController.toggleLike);
router.post('/:postId/comment', authMiddleware, postController.addComment);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;
