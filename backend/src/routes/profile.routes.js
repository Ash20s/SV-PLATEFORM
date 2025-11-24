const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profileController');
const { uploadAvatar, uploadBanner, uploadTeamLogo, uploadTeamBanner, handleUploadError } = require('../middlewares/upload.middleware');

// User profile routes
router.get('/user/:id', profileController.getUserProfile);
router.put('/', authMiddleware, profileController.updateProfile);
router.post('/avatar', authMiddleware, uploadAvatar, handleUploadError, profileController.uploadAvatar);
router.post('/banner', authMiddleware, uploadBanner, handleUploadError, profileController.uploadBanner);

// Team profile routes
router.get('/team/:teamId', profileController.getTeamProfile);
router.put('/team/:teamId', authMiddleware, profileController.updateTeamProfile);
router.post('/team/:teamId/logo', authMiddleware, uploadTeamLogo, handleUploadError, profileController.uploadTeamLogo);
router.post('/team/:teamId/banner', authMiddleware, uploadTeamBanner, handleUploadError, profileController.uploadTeamBanner);

module.exports = router;
