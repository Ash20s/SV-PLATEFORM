const express = require('express');
const router = express.Router();
const twitchController = require('../controllers/twitchController');
const authenticate = require('../middlewares/auth.middleware');

// Public routes
router.get('/live-streams', twitchController.getLiveStreams);

// Protected routes
router.get('/auth-url', authenticate, twitchController.getAuthUrl);
router.post('/callback', authenticate, twitchController.handleCallback);
router.delete('/unlink', authenticate, twitchController.unlinkAccount);
router.get('/my-stream', authenticate, twitchController.getMyStream);

module.exports = router;

