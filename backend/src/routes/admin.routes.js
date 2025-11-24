const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Protect all admin routes
router.use(authMiddleware);
router.use(isAdmin);

// Stats
router.get('/stats', adminController.getStats);

// Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.put('/reports/:id/reject', adminController.rejectReport);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/ban', adminController.toggleUserBan);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

module.exports = router;
