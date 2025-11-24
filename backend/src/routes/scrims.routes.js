const express = require('express');
const router = express.Router();
const scrimController = require('../controllers/scrimController');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

router.get('/', scrimController.getScrims);
router.get('/:id', scrimController.getScrim);
router.post('/', authMiddleware, requireRole(['organizer', 'admin']), scrimController.createScrim);
router.put('/:id', authMiddleware, requireRole(['captain', 'admin']), scrimController.updateScrim);
router.put('/:id/confirm', authMiddleware, requireRole(['captain', 'admin']), scrimController.confirmScrim);
router.put('/:id/results', authMiddleware, requireRole(['captain', 'admin']), scrimController.updateResults);
router.delete('/:id', authMiddleware, requireRole(['captain', 'admin']), scrimController.deleteScrim);

module.exports = router;
