const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const qualifierController = require('../controllers/qualifierController');
const lobbyController = require('../controllers/lobbyController');
const guestInviteController = require('../controllers/guestInviteController');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournament);
router.post('/', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.createTournament);
router.post('/:id/register', authMiddleware, requireRole(['captain', 'admin']), tournamentController.registerTeam);
router.post('/:id/invite-guest', authMiddleware, requireRole(['captain', 'admin']), guestInviteController.inviteGuestPlayer);
router.put('/:id/lock', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.lockTournament);
router.put('/:id/unlock', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.unlockTournament);
router.post('/:id/publish-scores', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.publishScores);
router.delete('/:id/reset-scores', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.resetScores);
router.put('/:id/brackets', authMiddleware, requireRole(['admin']), tournamentController.updateBrackets);

// Check-in routes
router.post('/:id/check-in', authMiddleware, requireRole(['captain', 'admin']), tournamentController.checkInTeam);
router.post('/:id/process-check-in', authMiddleware, requireRole(['admin', 'organizer']), tournamentController.processCheckIn);
router.post('/:id/waitlist', authMiddleware, requireRole(['captain', 'admin']), tournamentController.joinWaitlist);

// Qualifier groups routes
router.post('/:id/generate-groups', authMiddleware, requireRole(['admin', 'organizer']), qualifierController.generateQualifierGroups);
router.put('/:tournamentId/groups/:groupId/games/:gameId/results', authMiddleware, requireRole(['admin', 'organizer']), qualifierController.updateQualifierGameResults);
router.post('/:id/process-qualifications/:groupOrder', authMiddleware, requireRole(['admin', 'organizer']), lobbyController.processTournamentQualifications);

module.exports = router;
