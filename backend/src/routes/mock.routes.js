const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');
const authenticate = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// Routes pour le système mock (développement/test uniquement)
// Accessibles seulement en mode développement ou avec authentification admin

// Stats du mock
router.get('/stats', mockController.getMockStats);

// Liste des matches mock
router.get('/matches', mockController.listMockMatches);

// Ajouter un match mock
router.post('/match', authenticate, requireRole(['admin', 'organizer']), mockController.addMockMatch);

// Synchroniser un match mock
router.post('/sync/:matchId', authenticate, requireRole(['admin', 'organizer']), mockController.syncMockMatch);

// Synchroniser tous les matches mock
router.post('/sync-all', authenticate, requireRole(['admin', 'organizer']), mockController.syncAllMockMatches);

// Réinitialiser le mock
router.post('/reset', authenticate, requireRole(['admin']), mockController.resetMock);

module.exports = router;

