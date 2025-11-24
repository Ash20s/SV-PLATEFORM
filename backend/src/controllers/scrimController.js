const Scrim = require('../models/Scrim');
const Team = require('../models/Team');
const User = require('../models/User');
const statsCalculator = require('../services/statsCalculator');

/**
 * Get all scrims with filters
 * GET /api/scrims
 */
exports.getScrims = async (req, res) => {
  try {
    const { status, region, teamId, upcoming, limit = 20, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (region) query.region = region;
    if (teamId) {
      query.$or = [
        { host: teamId },
        { 'participants.team': teamId },
      ];
    }
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const scrims = await Scrim.find(query)
      .populate('organizer', 'username profile')
      .populate('host', 'name tag logo')
      .populate('participants.team', 'name tag logo')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Scrim.countDocuments(query);

    res.json({
      scrims,
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
 * Get single scrim by ID
 * GET /api/scrims/:id
 */
exports.getScrim = async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id)
      .populate('organizer', 'username profile')
      .populate('host', 'name tag logo')
      .populate('participants.team', 'name tag logo')
      .populate('games.results.team', 'name tag logo')
      .populate('finalStandings.team', 'name tag logo');

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found' });
    }

    res.json({ scrim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new scrim (Battle Royale lobby)
 * POST /api/scrims
 */
exports.createScrim = async (req, res) => {
  try {
    const { date, time, region, numberOfGames, maxTeams, notes, tier, gameMode } = req.body;

    // Check if user is organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers and admins can create scrims' });
    }

    // Parse date - handle ISO string or date string
    let scrimDate;
    if (date) {
      scrimDate = new Date(date);
      if (isNaN(scrimDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } else {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Extract time from date if not provided separately
    let scrimTime = time;
    if (!scrimTime && date) {
      const dateObj = new Date(date);
      scrimTime = dateObj.toTimeString().slice(0, 5); // HH:MM format
    }

    // Set game mode (default to Squad)
    const scrimGameMode = gameMode || 'Squad';
    
    // Set maxTeams based on game mode if not provided
    let scrimMaxTeams = maxTeams;
    if (!scrimMaxTeams) {
      scrimMaxTeams = scrimGameMode === 'Trio' ? 12 : 10;
    } else {
      // Validate maxTeams based on game mode
      const maxAllowed = scrimGameMode === 'Trio' ? 12 : 10;
      if (scrimMaxTeams > maxAllowed) {
        return res.status(400).json({ 
          message: `Maximum teams for ${scrimGameMode} mode is ${maxAllowed}` 
        });
      }
    }

    const scrim = await Scrim.create({
      organizer: req.user.id,
      date: scrimDate,
      time: scrimTime,
      region: region || 'EU',
      tier: tier || 'Both',
      gameMode: scrimGameMode,
      numberOfGames: numberOfGames || 1,
      maxTeams: scrimMaxTeams,
      notes: notes || '',
      status: 'open', // Default status - open for registrations
    });

    res.status(201).json({ message: 'Scrim created successfully', scrim });
  } catch (error) {
    console.error('Create scrim error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update scrim
 * PUT /api/scrims/:id
 */
exports.updateScrim = async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id);

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found' });
    }

    // Check if user is organizer or admin
    if (scrim.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer or admin can update scrim' });
    }

    const { date, time, numberOfGames, maxTeams, notes, status } = req.body;
    Object.assign(scrim, { date, time, numberOfGames, maxTeams, notes, status });
    await scrim.save();

    res.json({ message: 'Scrim updated successfully', scrim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Join/Confirm scrim participation
 * PUT /api/scrims/:id/confirm
 */
exports.confirmScrim = async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id);

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found' });
    }

    // Get user with teamId
    const user = await User.findById(req.user.id).populate('teamId');
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    // Check if user is captain of the team
    const team = await Team.findById(user.teamId._id || user.teamId);
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // Check if user is captain
    const isCaptain = team.captain.toString() === req.user.id.toString();
    if (!isCaptain && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can register teams for scrims' });
    }

    // Check if scrim is open for registration
    if (scrim.status !== 'open' && scrim.status !== 'pending') {
      return res.status(400).json({ message: 'Scrim is not open for registration' });
    }

    // Check team size matches game mode
    // Team size = 1 (captain) + roster.length
    const teamSize = 1 + (team.roster?.length || 0);
    const requiredSize = scrim.gameMode === 'Trio' ? 3 : 4;
    
    if (teamSize !== requiredSize) {
      return res.status(400).json({ 
        message: `Team must have exactly ${requiredSize} players for ${scrim.gameMode} mode. Your team has ${teamSize} player(s).` 
      });
    }

    // Check if team already in participants
    const existingParticipant = scrim.participants.find(
      p => p.team.toString() === team._id.toString()
    );

    if (existingParticipant) {
      if (existingParticipant.status === 'confirmed') {
        return res.status(400).json({ message: 'Team is already registered for this scrim' });
      }
      existingParticipant.status = 'confirmed';
    } else {
      // Check if scrim is full (max teams per lobby)
      const confirmedCount = scrim.participants.filter(p => p.status === 'confirmed').length;
      if (confirmedCount >= scrim.maxTeams) {
        return res.status(400).json({ message: `Scrim lobby is full (max ${scrim.maxTeams} teams per lobby)` });
      }
      scrim.participants.push({ team: team._id, status: 'confirmed' });
    }

    await scrim.save();

    res.json({ message: 'Scrim participation confirmed', scrim });
  } catch (error) {
    console.error('Confirm scrim error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update scrim results (Battle Royale format)
 * PUT /api/scrims/:id/results
 */
exports.updateResults = async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id);

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found' });
    }

    // Check if user is host captain
    const team = await Team.findOne({ _id: scrim.host, captain: req.user.id });
    if (!team) {
      return res.status(403).json({ message: 'Only host captain can update results' });
    }

    const { gameNumber, results, mapName, vodLink } = req.body;

    // Calculate points for each team
    const gameResults = results.map(result => ({
      team: result.teamId,
      placement: result.placement,
      kills: result.kills,
      points: statsCalculator.calculateTournamentPoints(result.placement, result.kills),
    }));

    // Add game to scrim
    scrim.games.push({
      gameNumber,
      results: gameResults,
      mapName,
      vodLink,
    });

    // Update final standings
    scrim.finalStandings = calculateFinalStandings(scrim.games);
    scrim.status = 'completed';

    await scrim.save();

    res.json({ message: 'Results updated successfully', scrim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete scrim
 * DELETE /api/scrims/:id
 */
exports.deleteScrim = async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id);

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found' });
    }

    // Check if user is host captain
    const team = await Team.findOne({ _id: scrim.host, captain: req.user.id });
    if (!team) {
      return res.status(403).json({ message: 'Only host captain can delete scrim' });
    }

    await scrim.deleteOne();

    res.json({ message: 'Scrim deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Calculate final standings across all games
 */
function calculateFinalStandings(games) {
  const teamTotals = {};

  games.forEach(game => {
    game.results.forEach(result => {
      const teamId = result.team.toString();
      if (!teamTotals[teamId]) {
        teamTotals[teamId] = {
          team: result.team,
          totalPoints: 0,
          totalKills: 0,
          placements: [],
        };
      }
      teamTotals[teamId].totalPoints += result.points;
      teamTotals[teamId].totalKills += result.kills;
      teamTotals[teamId].placements.push(result.placement);
    });
  });

  return Object.values(teamTotals)
    .map(team => ({
      team: team.team,
      totalPoints: team.totalPoints,
      totalKills: team.totalKills,
      avgPlacement: statsCalculator.calculateAvgPlacement(team.placements),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
