// Contrôleur pour gérer les matches et la synchronisation avec l'API Supervive

const Match = require('../models/Match');
const matchSyncService = require('../services/matchSyncService');
const superviveAPI = require('../services/superviveAPI');
const posterGeneratorService = require('../services/posterGeneratorService');

/**
 * Récupère tous les matches
 * GET /api/matches
 */
exports.getMatches = async (req, res) => {
  try {
    const { matchType, tournament, scrim, limit = 50, page = 1 } = req.query;

    const query = {};
    if (matchType) query.matchType = matchType;
    if (tournament) query.tournament = tournament;
    if (scrim) query.scrim = scrim;

    const matches = await Match.find(query)
      .populate('playerStats.player', 'username profile')
      .populate('tournament', 'name')
      .populate('scrim')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupère un match par ID
 * GET /api/matches/:id
 */
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('playerStats.player', 'username profile')
      .populate('tournament', 'name')
      .populate('scrim');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Synchronise manuellement les matches depuis l'API Supervive
 * POST /api/matches/sync
 */
exports.syncMatches = async (req, res) => {
  try {
    const { since, limit = 50 } = req.body;

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const matches = await superviveAPI.getMatches(sinceDate, limit);

    const syncedMatches = [];
    const errors = [];

    for (const match of matches) {
      try {
        const details = await superviveAPI.getMatchDetails(match.MatchID || match.matchId);
        if (details) {
          const normalized = superviveAPI.normalizeMatch(details);
          const synced = await matchSyncService.syncMatch(normalized, {
            matchType: req.body.matchType || 'casual',
            tournament: req.body.tournament,
            scrim: req.body.scrim
          });
          syncedMatches.push(synced);
        }
      } catch (error) {
        errors.push({
          matchId: match.MatchID || match.matchId,
          error: error.message
        });
      }
    }

    res.json({
      message: `Synced ${syncedMatches.length} matches`,
      synced: syncedMatches.length,
      errors: errors.length,
      details: {
        syncedMatches: syncedMatches.map(m => m._id),
        errors
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Démarre le polling automatique
 * POST /api/matches/poll/start
 */
exports.startPolling = async (req, res) => {
  try {
    if (superviveAPI.isPolling) {
      return res.json({ message: 'Polling already started' });
    }

    superviveAPI.startPolling(async (normalizedMatch) => {
      try {
        await matchSyncService.syncMatch(normalizedMatch, {
          matchType: 'casual'
        });
      } catch (error) {
        console.error('Error processing new match:', error);
      }
    });

    res.json({ message: 'Polling started successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Arrête le polling automatique
 * POST /api/matches/poll/stop
 */
exports.stopPolling = async (req, res) => {
  try {
    superviveAPI.stopPolling();
    res.json({ message: 'Polling stopped successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Génère un poster pour un joueur
 * POST /api/matches/:id/poster/player/:playerId
 */
exports.generatePlayerPoster = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('playerStats.player', 'username profile');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const playerStat = match.playerStats.find(
      p => p.player._id.toString() === req.params.playerId
    );

    if (!playerStat) {
      return res.status(404).json({ message: 'Player not found in this match' });
    }

    const posterPath = await posterGeneratorService.generatePlayerMatchPoster(
      {
        playerId: playerStat.player._id,
        playerName: playerStat.player.username,
        displayName: playerStat.player.profile?.displayName
      },
      {
        matchId: match.gameMatchId,
        damageDealt: playerStat.damageDealt,
        kills: playerStat.kills,
        assists: playerStat.assists,
        deaths: playerStat.deaths,
        placement: playerStat.finalPosition,
        revives: playerStat.revives,
        healing: playerStat.healing
      }
    );

    res.json({
      message: 'Poster generated successfully',
      posterUrl: posterPath,
      fullUrl: `${req.protocol}://${req.get('host')}${posterPath}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Génère un poster pour l'équipe gagnante
 * POST /api/matches/:id/poster/winner
 */
exports.generateWinnerPoster = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('playerStats.player', 'username profile')
      .populate('playerStats.ourTeamId', 'name tag logo');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Trouver l'équipe gagnante (placement 1)
    const winnerStats = match.playerStats.find(p => p.finalPosition === 1);
    if (!winnerStats || !winnerStats.ourTeamId) {
      return res.status(404).json({ message: 'No winner team found' });
    }

    const team = winnerStats.ourTeamId;
    const teamPlayers = match.playerStats
      .filter(p => p.ourTeamId && p.ourTeamId._id.toString() === team._id.toString())
      .map(p => ({
        playerId: p.player._id,
        playerName: p.player.username,
        displayName: p.player.profile?.displayName
      }));

    const teamStats = {
      totalKills: teamPlayers.reduce((sum, p) => {
        const stat = match.playerStats.find(ps => ps.player._id.toString() === p.playerId.toString());
        return sum + (stat?.kills || 0);
      }, 0),
      totalDamage: teamPlayers.reduce((sum, p) => {
        const stat = match.playerStats.find(ps => ps.player._id.toString() === p.playerId.toString());
        return sum + (stat?.damageDealt || 0);
      }, 0),
      placement: 1
    };

    const posterPath = await posterGeneratorService.generateWinnerTeamPoster(
      {
        teamId: team._id,
        name: team.name,
        tag: team.tag,
        players: teamPlayers
      },
      {
        matchId: match.gameMatchId,
        ...teamStats
      }
    );

    res.json({
      message: 'Winner poster generated successfully',
      posterUrl: posterPath,
      fullUrl: `${req.protocol}://${req.get('host')}${posterPath}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

