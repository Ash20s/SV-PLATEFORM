const Team = require('../models/Team');
const TeamStats = require('../models/TeamStats');
const User = require('../models/User');
const statsRecalculator = require('../services/statsRecalculator');

/**
 * Get all teams with filters
 * GET /api/teams
 */
exports.getTeams = async (req, res) => {
  try {
    const { region, search, sortBy = 'elo', limit = 20, page = 1 } = req.query;

    const query = {};
    if (region) query.region = region;
    if (search) query.name = { $regex: search, $options: 'i' };

    const teams = await Team.find(query)
      .populate('captain', 'username profile.avatar')
      .populate('roster.player', 'nickname')
      .sort({ [`stats.${sortBy}`]: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    // Populate team stats for each team
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const teamStats = await TeamStats.findOne({ team: team._id, period: 'alltime' });
        const teamObj = team.toObject();
        
        // Add stats to team object
        if (teamStats) {
          teamObj.stats = {
            gamesPlayed: teamStats.gamesPlayed || 0,
            tournamentsPlayed: teamStats.gamesPlayed || 0,
            tournamentsWon: teamStats.top1 || 0,
            wins: teamStats.top1 || 0,
            totalPoints: teamStats.totalPoints || 0,
            totalKills: teamStats.totalKills || 0,
            winrate: teamStats.winrate || 0,
            elo: teamStats.elo || team.stats?.elo || 1500,
          };
        } else {
          // Use default stats from team model if no TeamStats found
          teamObj.stats = {
            gamesPlayed: 0,
            tournamentsPlayed: team.stats?.tournamentsPlayed || 0,
            tournamentsWon: team.stats?.tournamentsWon || 0,
            wins: team.stats?.wins || 0,
            totalPoints: 0,
            totalKills: 0,
            winrate: team.stats?.winrate || 0,
            elo: team.stats?.elo || 1500,
          };
        }
        
        // Add roster length as members count (including captain if not in roster)
        const captainInRoster = team.roster?.some(
          (entry) => entry.player?.toString() === team.captain?.toString()
        );
        teamObj.membersCount = (team.roster ? team.roster.length : 0) + (captainInRoster ? 0 : 1);
        
        return teamObj;
      })
    );

    res.json({
      teams: teamsWithStats,
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
 * Get single team by ID
 * GET /api/teams/:id
 */
exports.getTeam = async (req, res) => {
  try {
    const { refresh = 'false' } = req.query; // Query param pour forcer le refresh
    
    const team = await Team.findById(req.params.id)
      .populate('captain', 'username profile')
      .populate('roster.player', 'username profile');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get team stats
    let stats = await TeamStats.findOne({ team: team._id, period: 'alltime' });

    // Si refresh=true ou si les stats sont obsolètes (plus de 1h), recalculer
    const shouldRefresh = refresh === 'true' || 
      !stats || 
      !stats.updatedAt || 
      (Date.now() - new Date(stats.updatedAt).getTime()) > 3600000; // 1 heure

    if (shouldRefresh) {
      try {
        stats = await statsRecalculator.recalculateTeamStats(team._id);
      } catch (error) {
        console.error('Error refreshing team stats:', error);
        // Continue avec les stats existantes si le recalcul échoue
      }
    }

    res.json({ team, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Force refresh of team stats and player stats
 * POST /api/teams/:id/refresh-stats
 */
exports.refreshTeamStats = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const result = await statsRecalculator.recalculateTeamAndPlayers(team._id);

    res.json({
      message: 'Team stats refreshed successfully',
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new team
 * POST /api/teams
 */
exports.createTeam = async (req, res) => {
  try {
    const { name, tag, logo, region, socials } = req.body;

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier que l'utilisateur a un rôle qui peut participer aux compétitions
    // Seuls 'player', 'captain', 'organizer' et 'admin' peuvent créer une équipe
    const allowedRoles = ['player', 'captain', 'organizer', 'admin'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: 'Only players, captains, organizers, and admins can create teams. Please contact an administrator to update your role.' 
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà une équipe
    if (user.teamId) {
      return res.status(400).json({ message: 'You already belong to a team' });
    }

    // Validation des champs requis
    if (!name || !tag || !region) {
      return res.status(400).json({ message: 'Team name, tag, and region are required' });
    }

    // Validation du tag (3-5 caractères)
    if (tag.length < 3 || tag.length > 5) {
      return res.status(400).json({ message: 'Team tag must be between 3 and 5 characters' });
    }

    // Vérifier les doublons (nom et tag, insensible à la casse)
    const existingName = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingName) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }

    const existingTag = await Team.findOne({ tag: { $regex: new RegExp(`^${tag}$`, 'i') } });
    if (existingTag) {
      return res.status(400).json({ message: 'A team with this tag already exists' });
    }

    // Create team (logo est optionnel, on ne l'inclut que s'il est fourni)
    const teamData = {
      name,
      tag,
      region,
      captain: req.user.id,
    };
    
    // Ajouter le logo seulement s'il est fourni et non vide
    if (logo && logo.trim()) {
      teamData.logo = logo.trim();
    }
    
    // Ajouter les socials seulement s'ils sont fournis
    if (socials) {
      teamData.socials = socials;
    }
    
    const team = await Team.create(teamData);

    // Update user role to captain and assign team
    await User.findByIdAndUpdate(req.user.id, {
      role: 'captain',
      teamId: team._id,
    });

    // Create initial team stats
    await TeamStats.create({
      team: team._id,
      period: 'alltime',
    });

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update team
 * PUT /api/teams/:id
 */
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can update' });
    }

    const { name, tag, logo, region, socials } = req.body;

    Object.assign(team, { name, tag, logo, region, socials });
    await team.save();

    res.json({ message: 'Team updated successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete team
 * DELETE /api/teams/:id
 */
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can delete' });
    }

    // Remove team reference from all members
    await User.updateMany(
      { teamId: team._id },
      { $unset: { teamId: '' }, role: 'player' }
    );

    await team.deleteOne();

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update roster (add/remove players)
 * POST /api/teams/:id/roster
 */
exports.updateRoster = async (req, res) => {
  try {
    const { action, playerId, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can manage roster' });
    }

    if (action === 'add') {
      const player = await User.findById(playerId);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }

      if (player.teamId) {
        return res.status(400).json({ message: 'Player already in a team' });
      }

      team.roster.push({ player: playerId, role, joinedAt: new Date() });
      await team.save();

      await User.findByIdAndUpdate(playerId, { teamId: team._id, role: 'player' });
    } else if (action === 'remove') {
      team.roster = team.roster.filter(r => r.player.toString() !== playerId);
      await team.save();

      await User.findByIdAndUpdate(playerId, { $unset: { teamId: '' }, role: 'viewer' });
    }

    res.json({ message: 'Roster updated successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
