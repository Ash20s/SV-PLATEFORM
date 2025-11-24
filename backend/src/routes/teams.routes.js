const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeam);
// Permettre à tous les utilisateurs authentifiés de créer une équipe (le contrôleur gérera la promotion de rôle)
router.post('/', authMiddleware, teamController.createTeam);
router.put('/:id', authMiddleware, requireRole(['captain', 'admin']), teamController.updateTeam);
router.delete('/:id', authMiddleware, requireRole(['captain', 'admin']), teamController.deleteTeam);
router.post('/:id/roster', authMiddleware, requireRole(['captain', 'admin']), teamController.updateRoster);
router.post('/:id/refresh-stats', authMiddleware, teamController.refreshTeamStats);

module.exports = router;
