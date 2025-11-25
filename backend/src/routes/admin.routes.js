const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const authenticate = require('../middlewares/auth.middleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Protect all admin routes
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/teams/mmr
 * Get all teams with MMR data
 */
router.get('/teams/mmr', async (req, res) => {
  try {
    const { tier } = req.query;
    
    let query = {};
    if (tier && tier !== 'ALL') {
      query.tier = tier;
    }

    const teams = await Team.find(query)
      .select('name tag tier mmr stats')
      .sort({ 'mmr.value': -1 });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams MMR:', error);
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

/**
 * PATCH /api/admin/teams/:id/mmr
 * Update team MMR manually
 */
router.patch('/teams/:id/mmr', async (req, res) => {
  try {
    const { id } = req.params;
    const { mmr } = req.body;

    if (typeof mmr !== 'number' || mmr < 0 || mmr > 3000) {
      return res.status(400).json({ message: 'Invalid MMR value (must be 0-3000)' });
    }

    // Calculate new tier based on MMR
    const newTier = calculateTier(mmr);

    const team = await Team.findByIdAndUpdate(
      id,
      {
        $set: {
          'mmr.value': mmr,
          'mmr.tier': newTier,
          'mmr.peak': Math.max(mmr, 0), // Update peak if higher
          'mmr.lastUpdated': new Date(),
        },
        $push: {
          'mmr.history': {
            mmr: mmr,
            change: 0,
            date: new Date(),
            reason: 'Manual admin adjustment'
          }
        }
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ 
      message: 'MMR updated successfully', 
      team: {
        _id: team._id,
        name: team.name,
        mmr: team.mmr
      }
    });
  } catch (error) {
    console.error('Error updating team MMR:', error);
    res.status(500).json({ message: 'Error updating MMR', error: error.message });
  }
});

/**
 * POST /api/admin/teams/calibrate-mmr
 * Auto-calibrate all teams based on their current tier and stats
 */
router.post('/teams/calibrate-mmr', async (req, res) => {
  try {
    const teams = await Team.find({});
    let calibrated = 0;

    for (const team of teams) {
      // Skip if team already has custom MMR set recently
      if (team.mmr?.lastUpdated && 
          (Date.now() - new Date(team.mmr.lastUpdated).getTime()) < 24 * 60 * 60 * 1000) {
        continue; // Skip teams updated in last 24h
      }

      // Calculate suggested MMR based on tier and stats
      let baseMMR = 1200; // Default starting MMR

      // Base MMR by tier
      if (team.tier === 'Tier 1') {
        baseMMR = 2000;
      } else if (team.tier === 'Tier 2') {
        baseMMR = 1500;
      } else if (team.tier === 'Amateur') {
        baseMMR = 1100;
      }

      // Adjust based on win rate
      const wins = team.stats?.wins || 0;
      const losses = team.stats?.losses || 0;
      const totalGames = wins + losses;

      if (totalGames > 0) {
        const winRate = wins / totalGames;
        
        if (winRate > 0.75) {
          baseMMR += 300;
        } else if (winRate > 0.65) {
          baseMMR += 200;
        } else if (winRate > 0.55) {
          baseMMR += 100;
        } else if (winRate < 0.35) {
          baseMMR -= 150;
        } else if (winRate < 0.45) {
          baseMMR -= 50;
        }
      }

      // Bonus for tournament wins
      const tournamentsWon = team.stats?.tournamentsWon || 0;
      baseMMR += tournamentsWon * 50;

      // Ensure MMR is within bounds
      const finalMMR = Math.max(1000, Math.min(2600, baseMMR));
      const newTier = calculateTier(finalMMR);

      // Update team
      await Team.findByIdAndUpdate(team._id, {
        $set: {
          'mmr.value': finalMMR,
          'mmr.tier': newTier,
          'mmr.peak': Math.max(finalMMR, team.mmr?.peak || 0),
          'mmr.lastUpdated': new Date(),
          'mmr.gamesPlayed': totalGames,
          'mmr.isCalibrating': totalGames < 10, // Still calibrating if < 10 games
        },
        $push: {
          'mmr.history': {
            mmr: finalMMR,
            change: finalMMR - (team.mmr?.value || 1200),
            date: new Date(),
            reason: 'Auto-calibration'
          }
        }
      });

      calibrated++;
    }

    res.json({ 
      message: 'Calibration complete', 
      calibrated,
      total: teams.length 
    });
  } catch (error) {
    console.error('Error calibrating MMR:', error);
    res.status(500).json({ message: 'Error calibrating MMR', error: error.message });
  }
});

/**
 * Helper: Calculate tier based on MMR
 */
function calculateTier(mmr) {
  if (mmr >= 2200) return 'ELITE';
  if (mmr >= 1900) return 'T1';
  if (mmr >= 1600) return 'T2H';
  if (mmr >= 1300) return 'T2';
  return 'T3';
}

module.exports = router;
