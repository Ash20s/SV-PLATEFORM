// Contrôleur pour gérer le système mock de l'API Supervive
// Permet de tester sans avoir accès à la vraie API

const superviveAPIMock = require('../services/superviveAPIMock');
const matchSyncService = require('../services/matchSyncService');
const superviveAPI = require('../services/superviveAPI');

/**
 * Récupère les statistiques du mock
 * GET /api/mock/stats
 */
exports.getMockStats = async (req, res) => {
  try {
    const stats = superviveAPIMock.getStats();
    res.json({
      message: 'Mock API Statistics',
      stats,
      mode: superviveAPI.useMock ? 'MOCK' : 'REAL'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Ajoute un match de test
 * POST /api/mock/match
 */
exports.addMockMatch = async (req, res) => {
  try {
    const match = superviveAPIMock.addMockMatch();
    res.json({
      message: 'Mock match created',
      match: {
        matchId: match.MatchID,
        matchStart: match.MatchDetails.MatchStart,
        numTeams: match.MatchDetails.NumTeams,
        numParticipants: match.MatchDetails.NumParticipants
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Synchronise un match mock
 * POST /api/mock/sync/:matchId
 */
exports.syncMockMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchData = await superviveAPIMock.getMatchDetails(matchId);
    
    if (!matchData) {
      return res.status(404).json({ message: 'Mock match not found' });
    }

    const normalized = superviveAPI.normalizeMatch(matchData);
    const synced = await matchSyncService.syncMatch(normalized, {
      matchType: req.body.matchType || 'casual',
      tournament: req.body.tournament,
      scrim: req.body.scrim
    });

    res.json({
      message: 'Mock match synced successfully',
      match: synced
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Synchronise tous les matches mock disponibles
 * POST /api/mock/sync-all
 */
exports.syncAllMockMatches = async (req, res) => {
  try {
    const matches = await superviveAPIMock.getMatches(null, 100);
    const syncedMatches = [];
    const errors = [];

    for (const match of matches) {
      try {
        const normalized = superviveAPI.normalizeMatch(match);
        const synced = await matchSyncService.syncMatch(normalized, {
          matchType: req.body.matchType || 'casual',
          tournament: req.body.tournament,
          scrim: req.body.scrim
        });
        syncedMatches.push(synced);
      } catch (error) {
        errors.push({
          matchId: match.MatchID,
          error: error.message
        });
      }
    }

    res.json({
      message: `Synced ${syncedMatches.length} mock matches`,
      synced: syncedMatches.length,
      errors: errors.length,
      details: {
        syncedMatches: syncedMatches.map(m => ({
          id: m._id,
          matchId: m.gameMatchId
        })),
        errors
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Réinitialise le mock
 * POST /api/mock/reset
 */
exports.resetMock = async (req, res) => {
  try {
    superviveAPIMock.reset();
    res.json({
      message: 'Mock data reset successfully',
      stats: superviveAPIMock.getStats()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Liste tous les matches mock disponibles
 * GET /api/mock/matches
 */
exports.listMockMatches = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const matches = await superviveAPIMock.getMatches(null, parseInt(limit));
    
    res.json({
      matches: matches.map(m => ({
        matchId: m.MatchID,
        matchStart: m.MatchDetails.MatchStart,
        matchEnd: m.MatchDetails.MatchEnd,
        numTeams: m.MatchDetails.NumTeams,
        numParticipants: m.MatchDetails.NumParticipants,
        region: m.MatchDetails.ConnectionDetails?.Region,
        winner: Object.values(m.TeamMatchDetails).find(t => t.Placement === 1)?.TeamID || null
      })),
      total: matches.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

