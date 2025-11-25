const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

/**
 * GET /api/leaderboard
 * Leaderboard with filters
 */
router.get('/', async (req, res) => {
  try {
    const { tier, format, period, matchType } = req.query;

    // Build query
    let query = {};

    // Filter by tier
    if (tier && tier !== 'ALL') {
      query['mmr.tier'] = tier;
    }

    // Filter by format (si vous ajoutez le format dans le modèle)
    if (format && format !== 'ALL') {
      query.format = format;
    }

    // Period filter (basé sur lastMatchDate)
    if (period && period !== 'ALL_TIME') {
      const now = new Date();
      if (period === 'WEEKLY') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.lastMatchDate = { $gte: weekAgo };
      } else if (period === 'MONTHLY') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query.lastMatchDate = { $gte: monthAgo };
      }
    }

    // Fetch teams
    const teams = await Team.find(query)
      .populate('roster.player', 'username avatar')
      .sort({ 'mmr.value': -1 }) // Sort by MMR descending
      .limit(100); // Top 100

    // Transform data for frontend
    const leaderboard = teams.map(team => {
      const history = team.mmr?.history || [];
      
      // Calculate stats based on matchType filter
      let avgPlacement, gamesPlayed;
      if (matchType === 'SCRIMS') {
        avgPlacement = calculateAvgPlacementByType(history, 'Scrim');
        gamesPlayed = countGamesByType(history, 'Scrim');
      } else if (matchType === 'TOURNAMENTS') {
        avgPlacement = calculateAvgPlacementByType(history, 'Tournament');
        gamesPlayed = countGamesByType(history, 'Tournament');
      } else {
        // ALL - combine both
        avgPlacement = calculateAvgPlacement(history);
        gamesPlayed = team.mmr?.gamesPlayed || 0;
      }

      return {
        _id: team._id,
        name: team.name,
        tag: team.tag,
        mmr: team.mmr?.value || 1200,
        tier: calculateTier(team.mmr?.value || 1200),
        avgPlacement: avgPlacement,
        avgPlacementScrims: calculateAvgPlacementByType(history, 'Scrim'),
        avgPlacementTournaments: calculateAvgPlacementByType(history, 'Tournament'),
        bestPlacement: calculateBestPlacement(history),
        gamesPlayed: gamesPlayed,
        gamesPlayedScrims: countGamesByType(history, 'Scrim'),
        gamesPlayedTournaments: countGamesByType(history, 'Tournament'),
        recentForm: team.mmr?.recentForm || [],
        mmrTrend: calculateTrend(history),
        members: team.roster || [],
        avatar: team.logo,
        format: team.format || 'BOTH',
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
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

/**
 * Helper: Calculate MMR trend
 */
function calculateTrend(history) {
  if (!history || history.length < 2) return 'STABLE';

  // Compare last 5 games
  const recent = history.slice(-5);
  if (recent.length < 2) return 'STABLE';

  const first = recent[0].mmr;
  const last = recent[recent.length - 1].mmr;
  const diff = last - first;

  if (diff > 20) return 'UP';
  if (diff < -20) return 'DOWN';
  return 'STABLE';
}

/**
 * Helper: Calculate average placement from match history
 */
function calculateAvgPlacement(history) {
  if (!history || history.length === 0) return null;

  // Filter only matches with placement data
  const matchesWithPlacement = history.filter(h => h.placement && h.placement > 0);
  
  if (matchesWithPlacement.length === 0) return null;

  const totalPlacement = matchesWithPlacement.reduce((sum, h) => sum + h.placement, 0);
  return totalPlacement / matchesWithPlacement.length;
}

/**
 * Helper: Calculate best placement from match history
 */
function calculateBestPlacement(history) {
  if (!history || history.length === 0) return null;

  // Filter only matches with placement data
  const matchesWithPlacement = history.filter(h => h.placement && h.placement > 0);
  
  if (matchesWithPlacement.length === 0) return null;

  // Best placement = lowest number (1st is best)
  return Math.min(...matchesWithPlacement.map(h => h.placement));
}

/**
 * Helper: Calculate average placement by match type (Scrim or Tournament)
 */
function calculateAvgPlacementByType(history, matchType) {
  if (!history || history.length === 0) return null;

  // Filter by matchType and placement data
  const matchesFiltered = history.filter(h => 
    h.matchType === matchType && h.placement && h.placement > 0
  );
  
  if (matchesFiltered.length === 0) return null;

  const totalPlacement = matchesFiltered.reduce((sum, h) => sum + h.placement, 0);
  return totalPlacement / matchesFiltered.length;
}

/**
 * Helper: Count games by match type
 */
function countGamesByType(history, matchType) {
  if (!history || history.length === 0) return 0;

  return history.filter(h => 
    h.matchType === matchType && h.placement && h.placement > 0
  ).length;
}

module.exports = router;

