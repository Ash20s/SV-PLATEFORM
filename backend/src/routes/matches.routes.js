const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authenticate = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// Routes publiques
router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatch);

// Routes authentifiées
router.post('/sync', authenticate, requireRole(['organizer', 'admin']), matchController.syncMatches);
router.post('/poll/start', authenticate, requireRole(['admin']), matchController.startPolling);
router.post('/poll/stop', authenticate, requireRole(['admin']), matchController.stopPolling);

// Génération de posters
router.post('/:id/poster/player/:playerId', authenticate, matchController.generatePlayerPoster);
router.post('/:id/poster/winner', authenticate, matchController.generateWinnerPoster);

module.exports = router;

