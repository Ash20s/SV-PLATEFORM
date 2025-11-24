const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/players/:id', statsController.getPlayerStats);
router.get('/teams/:id', statsController.getTeamStats);
router.get('/leaderboard', statsController.getLeaderboard);

module.exports = router;
