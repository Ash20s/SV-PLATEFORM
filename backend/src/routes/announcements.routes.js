const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

router.get('/', announcementController.getAnnouncements);
router.post('/', authMiddleware, requireRole(['captain', 'admin']), announcementController.createAnnouncement);

module.exports = router;
