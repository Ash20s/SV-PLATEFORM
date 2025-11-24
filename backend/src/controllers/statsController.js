const PlayerStats = require('../models/PlayerStats');
const TeamStats = require('../models/TeamStats');
const Player = require('../models/Player');
const Team = require('../models/Team');

/**
 * Get player stats by ID
 * GET /api/stats/players/:id
 */
exports.getPlayerStats = async (req, res) => {
  try {
    const { period = 'alltime' } = req.query;

    const stats = await PlayerStats.findOne({
      player: req.params.id,
      period,
    }).populate('player', 'nickname user');

    if (!stats) {
      return res.status(404).json({ message: 'Player stats not found' });
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get team stats by ID
 * GET /api/stats/teams/:id
 */
exports.getTeamStats = async (req, res) => {
  try {
    const { period = 'alltime' } = req.query;

    const stats = await TeamStats.findOne({
      team: req.params.id,
      period,
    }).populate('team', 'name tag logo');

    if (!stats) {
      return res.status(404).json({ message: 'Team stats not found' });
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get leaderboards (teams and players)
 * GET /api/stats/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'teams', metric = 'elo', region, limit = 50 } = req.query;

    if (type === 'teams') {
      const query = { period: 'alltime' };
      
      const teamStats = await TeamStats.find(query)
        .populate({
          path: 'team',
          match: region ? { region } : {},
          select: 'name tag logo region',
        })
        .sort({ [metric]: -1 })
        .limit(parseInt(limit));

      // Filter out null teams (region mismatch)
      const filteredStats = teamStats.filter(stat => stat.team);

      res.json({ leaderboard: filteredStats, type: 'teams', metric });
    } else if (type === 'players') {
      const query = { period: 'alltime' };

      const playerStats = await PlayerStats.find(query)
        .populate({
          path: 'player',
          populate: {
            path: 'user team',
            select: 'username profile.avatar team.name team.tag',
          },
        })
        .sort({ [metric]: -1 })
        .limit(parseInt(limit));

      res.json({ leaderboard: playerStats, type: 'players', metric });
    } else {
      res.status(400).json({ message: 'Invalid leaderboard type' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
