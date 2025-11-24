const express = require('express');
const router = express.Router();
const guestInviteController = require('../controllers/guestInviteController');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// Get pending invites for current user
router.get('/pending', authMiddleware, guestInviteController.getPendingInvites);

// Accept invite
router.post('/:id/accept', authMiddleware, guestInviteController.acceptInvite);

// Reject invite
router.post('/:id/reject', authMiddleware, guestInviteController.rejectInvite);

// Cancel invite (Captain/Admin only)
router.delete('/:id', authMiddleware, guestInviteController.cancelInvite);


module.exports = router;

