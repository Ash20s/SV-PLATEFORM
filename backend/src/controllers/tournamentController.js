const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const User = require('../models/User');
const statsCalculator = require('../services/statsCalculator');

/**
 * Get all tournaments with filters
 * GET /api/tournaments
 */
exports.getTournaments = async (req, res) => {
  try {
    const { status, region, upcoming, limit = 20, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (region) query.region = region;
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tournaments = await Tournament.find(query)
      .populate('organizer', 'username profile')
      .populate('registeredTeams.team', 'name tag logo')
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single tournament by ID
 * GET /api/tournaments/:id
 */
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'username profile')
      .populate('registeredTeams.team', 'name tag logo stats captain roster')
      .populate('registeredTeams.checkedInBy', 'username')
      .populate('registeredTeams.participatingPlayers.player', 'username profile')
      .populate('registeredTeams.guestPlayers.player', 'username profile')
      .populate('registeredTeams.guestPlayers.invitedBy', 'username')
      .populate('registeredTeams.guestPlayers.replacingPlayer', 'username')
      .populate('standings.team', 'name tag logo')
      .populate('games.results.team', 'name tag logo')
      .populate('qualifierGroups.teams', 'name tag logo')
      .populate('qualifierGroups.standings.team', 'name tag logo')
      .populate('qualifiedTeams', 'name tag logo');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json({ tournament });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create tournament (Admin/Organizer only)
 * POST /api/tournaments
 */
exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      description,
      gameMode,
      format,
      tier,
      region,
      maxTeams,
      numberOfGames,
      prizePool,
      prizeDistribution,
      pointsSystem,
      startDate,
      endDate,
      rules,
      hasQualifiers,
      qualifierSettings,
    } = req.body;

    if (!name || !gameMode || !startDate) {
      return res.status(400).json({ message: 'Name, game mode, and start date are required' });
    }

    const tournamentData = {
      name,
      description,
      gameMode,
      format: format || 'points-based',
      maxTeams: maxTeams || (gameMode === 'Trio' ? 12 : 10),
      numberOfGames: numberOfGames || 6,
      prizePool,
      prizeDistribution,
      pointsSystem,
      startDate,
      endDate,
      rules,
      tier: tier || 'Both',
      region: region || 'EU',
      organizer: req.user.id,
      status: 'registration',
      checkInSettings: {
        enabled: true,
        opensAt: new Date(new Date(startDate).getTime() - 2 * 60 * 60 * 1000),
        closesAt: new Date(new Date(startDate).getTime() - 30 * 60 * 1000),
      },
    };

    if (hasQualifiers && qualifierSettings) {
      tournamentData.hasQualifiers = true;
      tournamentData.qualifierSettings = {
        numberOfGroups: qualifierSettings.numberOfGroups || 2,
        teamsPerGroup: qualifierSettings.teamsPerGroup,
        qualifiersPerGroup: qualifierSettings.qualifiersPerGroup || 8,
        gamesPerGroup: qualifierSettings.gamesPerGroup || 3,
        transferNonQualified: qualifierSettings.transferNonQualified || false,
      };
    }

    const tournament = await Tournament.create(tournamentData);

    res.status(201).json({ message: 'Tournament created successfully', tournament });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Register team for tournament with player selection
 * POST /api/tournaments/:id/register
 * Body: { 
 *   selectedPlayers?: [userId],  // Optional: players to select (if team has more than required)
 *   guestPlayers?: [{ playerId, role }]  // Optional: guest players (subs) to invite
 * }
 */
exports.registerTeam = async (req, res) => {
  try {
    const { selectedPlayers, guestPlayers } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    // Get user's team with populated roster
    const user = await User.findById(req.user.id).populate('teamId');
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    const team = await Team.findById(user.teamId._id || user.teamId)
      .populate('captain', 'username')
      .populate('roster.player', 'username');
    
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // Check if user is captain
    const isCaptain = team.captain.toString() === req.user.id.toString();
    if (!isCaptain && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can register teams for tournaments' });
    }

    // Check if team already registered
    const alreadyRegistered = tournament.registeredTeams.some(
      rt => rt.team.toString() === team._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Team already registered' });
    }

    // Check max teams limit (per lobby)
    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      return res.status(400).json({ message: `Tournament lobby is full (max ${tournament.maxTeams} teams per lobby)` });
    }

    // Get all available players (captain + roster)
    const allTeamPlayers = [team.captain._id, ...(team.roster?.map(r => r.player._id || r.player) || [])];
    const requiredSize = tournament.gameMode === 'Trio' ? 3 : 4; // Squad = 4, Trio = 3

    // Determine participating players
    let participatingPlayers = [];

    if (selectedPlayers && selectedPlayers.length > 0) {
      // Captain selected specific players
      if (selectedPlayers.length !== requiredSize) {
        return res.status(400).json({ 
          message: `Must select exactly ${requiredSize} players for ${tournament.gameMode} mode. You selected ${selectedPlayers.length}.` 
        });
      }

      // Validate all selected players are part of the team
      const invalidPlayers = selectedPlayers.filter(playerId => 
        !allTeamPlayers.some(tp => tp.toString() === playerId.toString())
      );

      if (invalidPlayers.length > 0) {
        return res.status(400).json({ 
          message: 'All selected players must be part of your team' 
        });
      }

      // Build participating players array with roles
      participatingPlayers = selectedPlayers.map((playerId, index) => {
        const player = allTeamPlayers.find(tp => tp.toString() === playerId.toString());
        const rosterEntry = team.roster?.find(r => (r.player._id || r.player).toString() === playerId.toString());
        return {
          player: playerId,
          isGuest: false,
          isMainRoster: true,
          role: rosterEntry?.role || (index === 0 ? 'DPS' : index === 1 ? 'Tank' : index === 2 ? 'Support' : 'Flex'),
        };
      });
    } else {
      // No selection provided - auto-select if team size matches exactly
      if (allTeamPlayers.length === requiredSize) {
        // Perfect match - use all team players
        participatingPlayers = allTeamPlayers.map((playerId, index) => {
          const rosterEntry = team.roster?.find(r => (r.player._id || r.player).toString() === playerId.toString());
          const isCaptain = playerId.toString() === team.captain._id.toString();
          return {
            player: playerId,
            isGuest: false,
            isMainRoster: true,
            role: isCaptain ? 'Captain' : (rosterEntry?.role || (index === 0 ? 'DPS' : index === 1 ? 'Tank' : index === 2 ? 'Support' : 'Flex')),
          };
        });
      } else {
        // Team size doesn't match - require player selection
        return res.status(400).json({ 
          message: `Your team has ${allTeamPlayers.length} player(s). Please select exactly ${requiredSize} players to participate in this ${tournament.gameMode} tournament.`,
          requiresSelection: true,
          availablePlayers: allTeamPlayers,
          requiredSize: requiredSize,
        });
      }
    }

    // Handle guest players (subs) if provided
    const GuestInvite = require('../models/GuestInvite');
    const guestInvites = [];
    const guestPlayersData = [];

    if (guestPlayers && guestPlayers.length > 0) {
      // Validate guest players
      for (const guest of guestPlayers) {
        if (!guest.playerId || !guest.role) {
          return res.status(400).json({ 
            message: 'Each guest player must have playerId and role' 
          });
        }

        // Check if guest player is already in the team
        const isTeamPlayer = allTeamPlayers.some(tp => tp.toString() === guest.playerId.toString());
        if (isTeamPlayer) {
          return res.status(400).json({ 
            message: `Player ${guest.playerId} is already part of your team. Guest players must be external.` 
          });
        }

        // Check if player exists
        const guestUser = await User.findById(guest.playerId);
        if (!guestUser) {
          return res.status(404).json({ message: `Guest player ${guest.playerId} not found` });
        }

        // Create guest invite
        const invite = await GuestInvite.create({
          tournament: tournament._id,
          team: team._id,
          guestPlayer: guest.playerId,
          invitedBy: req.user.id,
          role: guest.role,
          replacingPlayer: guest.replacingPlayer || null,
          message: guest.message || null,
          status: 'pending',
        });

        guestInvites.push(invite);

        // Add to guest players in registration (will be added to participatingPlayers when accepted)
        guestPlayersData.push({
          player: guest.playerId,
          inviteStatus: 'pending',
          invitedAt: new Date(),
          invitedBy: req.user.id,
          role: guest.role,
          replacingPlayer: guest.replacingPlayer || null,
        });
      }
    }

    // Register team with participating players
    const registration = {
      team: team._id,
      registeredAt: new Date(),
      checkedIn: false,
      participatingPlayers: participatingPlayers,
      guestPlayers: guestPlayersData,
    };

    tournament.registeredTeams.push(registration);
    
    // Initialize standings entry
    tournament.standings.push({
      team: team._id,
      totalPoints: 0,
      totalKills: 0,
      avgPlacement: 0,
      wins: 0,
      gamesPlayed: 0,
    });

    await tournament.save();

    res.json({ 
      message: 'Team registered successfully', 
      tournament,
      guestInvites: guestInvites.map(inv => ({
        id: inv._id,
        guestPlayer: inv.guestPlayer,
        status: inv.status,
        expiresAt: inv.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Register team error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update participating players for a registered team
 * PUT /api/tournaments/:id/players
 * Body: { selectedPlayers: [userId] }
 */
exports.updateTeamPlayers = async (req, res) => {
  try {
    const { selectedPlayers } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Can only update players during registration period' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    const team = await Team.findById(user.teamId)
      .populate('captain', 'username')
      .populate('roster.player', 'username');

    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    const isCaptain = team.captain.toString() === req.user.id.toString();
    if (!isCaptain && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can update players' });
    }

    const registration = tournament.registeredTeams.find(
      rt => rt.team.toString() === team._id.toString()
    );

    if (!registration) {
      return res.status(400).json({ message: 'Team is not registered for this tournament' });
    }

    const requiredSize = tournament.gameMode === 'Trio' ? 3 : 4;
    const allTeamPlayers = [team.captain._id, ...(team.roster?.map(r => r.player._id || r.player) || [])];

    if (selectedPlayers && selectedPlayers.length > 0) {
      if (selectedPlayers.length !== requiredSize) {
        return res.status(400).json({ 
          message: `Must select exactly ${requiredSize} players for ${tournament.gameMode} mode` 
        });
      }

      const invalidPlayers = selectedPlayers.filter(playerId => 
        !allTeamPlayers.some(tp => tp.toString() === playerId.toString())
      );

      if (invalidPlayers.length > 0) {
        return res.status(400).json({ 
          message: 'All selected players must be part of your team' 
        });
      }

      // Keep guest players that are already accepted
      const acceptedGuests = registration.participatingPlayers?.filter(pp => pp.isGuest) || [];
      
      // Update main roster players
      registration.participatingPlayers = selectedPlayers.map((playerId, index) => {
        const rosterEntry = team.roster?.find(r => (r.player._id || r.player).toString() === playerId.toString());
        return {
          player: playerId,
          isGuest: false,
          isMainRoster: true,
          role: rosterEntry?.role || (index === 0 ? 'DPS' : index === 1 ? 'Tank' : index === 2 ? 'Support' : 'Flex'),
        };
      });

      // Add accepted guests back
      registration.participatingPlayers = [...registration.participatingPlayers, ...acceptedGuests];
    }

    await tournament.save();

    res.json({ 
      message: 'Team players updated successfully', 
      tournament 
    });
  } catch (error) {
    console.error('Update team players error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lock tournament (close registration and prepare for start)
 * PUT /api/tournaments/:id/lock
 */
exports.lockTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOrganizerRole = req.user.role === 'organizer';
    const isTournamentOrganizer = tournament.organizer.toString() === req.user.id;
    
    if (!isTournamentOrganizer && !isAdmin && !isOrganizerRole) {
      return res.status(403).json({ message: 'Only organizer or admin can lock tournament' });
    }

    if (tournament.status === 'completed') {
      return res.status(400).json({ message: 'Cannot lock a completed tournament' });
    }

    if (tournament.status === 'locked' || tournament.status === 'ongoing') {
      return res.status(400).json({ message: 'Tournament is already locked or ongoing' });
    }

    if (!tournament.registeredTeams || tournament.registeredTeams.length === 0) {
      return res.status(400).json({ message: 'Cannot lock tournament with no registered teams' });
    }

    if (tournament.hasQualifiers) {
      if (!tournament.qualifierGroups || tournament.qualifierGroups.length === 0) {
        return res.status(400).json({ 
          message: 'Cannot lock tournament: qualifier groups must be generated first' 
        });
      }
    }

    tournament.status = 'locked';
    await tournament.save();

    res.json({ 
      message: 'Tournament locked successfully', 
      tournament 
    });
  } catch (error) {
    console.error('Lock tournament error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unlock tournament (reopen registration)
 * PUT /api/tournaments/:id/unlock
 */
/**
 * Publish games to scoreboard (Organizer/Admin only)
 * POST /api/tournaments/:id/publish-scores
 * This will add all newly completed games to the published games list
 */
exports.publishScores = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is organizer or admin
    const isOrganizer = tournament.organizer.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ 
        message: 'Only tournament organizer or admin can publish scores' 
      });
    }

    // Only allow publishing if tournament is locked, ongoing, or completed
    if (!['locked', 'ongoing', 'completed'].includes(tournament.status)) {
      return res.status(400).json({ 
        message: 'Scores can only be published when tournament is locked, ongoing, or completed' 
      });
    }

    // Get all games that have results
    const allGames = Array.isArray(tournament.games) ? tournament.games : [];
    const gamesWithResults = allGames.filter(game => 
      game.results && 
      Array.isArray(game.results) && 
      game.results.length > 0 &&
      game.status === 'completed'
    );

    if (gamesWithResults.length === 0) {
      return res.status(400).json({ 
        message: 'No completed games with results available to publish' 
      });
    }

    // Get current published games (default to empty array if not set)
    const publishedGames = Array.isArray(tournament.publishedGames) ? tournament.publishedGames : [];
    
    // Find games that are not yet published
    const newGamesToPublish = gamesWithResults
      .filter(game => {
        const gameNumber = game.gameNumber || 0;
        return gameNumber > 0 && !publishedGames.includes(gameNumber);
      })
      .map(game => game.gameNumber || 0)
      .filter(num => num > 0)
      .sort((a, b) => a - b); // Sort by game number

    if (newGamesToPublish.length === 0) {
      return res.status(400).json({ 
        message: 'All available games have already been published' 
      });
    }

    // Add new games to published list
    tournament.publishedGames = [...publishedGames, ...newGamesToPublish].sort((a, b) => a - b);

    // Recalculate standings based on published games only
    if (tournament.publishedGames.length > 0) {
      const standingsMap = new Map();
      
      // Only calculate from published games
      allGames.forEach(game => {
        const gameNumber = game.gameNumber || 0;
        if (!tournament.publishedGames.includes(gameNumber)) return;
        
        if (game.results && Array.isArray(game.results)) {
          game.results.forEach(result => {
            const teamId = result.team?._id?.toString() || result.team?.toString();
            if (!teamId) return;
            
            if (!standingsMap.has(teamId)) {
              standingsMap.set(teamId, {
                team: teamId,
                totalPoints: 0,
                totalKills: 0,
                totalPlacementPoints: 0,
                gamesPlayed: 0,
                placements: [],
                kills: [],
              });
            }
            
            const standing = standingsMap.get(teamId);
            standing.totalPoints += result.totalPoints || 0;
            standing.totalKills += result.kills || 0;
            standing.totalPlacementPoints += result.placementPoints || 0;
            standing.gamesPlayed += 1;
            standing.placements.push(result.placement || 12);
            standing.kills.push(result.kills || 0);
          });
        }
      });
      
      // Convert to array and calculate avgPlacement
      tournament.standings = Array.from(standingsMap.values()).map(standing => ({
        team: standing.team,
        totalPoints: standing.totalPoints,
        totalKills: standing.totalKills,
        totalPlacementPoints: standing.totalPlacementPoints,
        gamesPlayed: standing.gamesPlayed,
        avgPlacement: standing.placements.length > 0 
          ? standing.placements.reduce((a, b) => a + b, 0) / standing.placements.length 
          : 12,
        wins: standing.placements.filter(p => p === 1).length,
      }));
    }

    await tournament.save();

    res.json({ 
      message: `Published ${newGamesToPublish.length} new game(s) to scoreboard`,
      publishedGames: tournament.publishedGames,
      newlyPublished: newGamesToPublish,
      tournament 
    });
  } catch (error) {
    console.error('Publish scores error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reset scoreboard (remove all published games)
 * DELETE /api/tournaments/:id/reset-scores
 */
exports.resetScores = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is organizer or admin
    const isOrganizer = tournament.organizer.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ 
        message: 'Only tournament organizer or admin can reset scores' 
      });
    }

    tournament.publishedGames = [];
    tournament.standings = [];
    await tournament.save();

    res.json({ 
      message: 'Scoreboard reset successfully',
      tournament 
    });
  } catch (error) {
    console.error('Reset scores error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.unlockTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOrganizerRole = req.user.role === 'organizer';
    const isTournamentOrganizer = tournament.organizer.toString() === req.user.id;

    if (!isTournamentOrganizer && !isAdmin && !isOrganizerRole) {
      return res.status(403).json({ message: 'Only organizer or admin can unlock tournament' });
    }

    if (tournament.status !== 'locked') {
      return res.status(400).json({ 
        message: `Cannot unlock tournament with status: ${tournament.status}` 
      });
    }

    tournament.status = 'registration';
    await tournament.save();

    res.json({ 
      message: 'Tournament unlocked successfully', 
      tournament 
    });
  } catch (error) {
    console.error('Unlock tournament error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update tournament game results
 * PUT /api/tournaments/:id/brackets
 */
exports.updateBrackets = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const { gameNumber, results, mapName, vodLink, date } = req.body;

    if (!gameNumber || !results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'gameNumber and results array are required' });
    }

    // Calculate standings
    tournament.standings = calculateTournamentStandings(
      [...(tournament.games || []), { results }],
      tournament.registeredTeams,
      tournament
    );

    // Add or update game
    const existingGameIndex = tournament.games.findIndex(g => g.gameNumber === gameNumber);
    const gameData = {
      gameNumber,
      date: date ? new Date(date) : new Date(),
      status: 'completed',
      results: results.map(r => ({
        team: r.teamId,
        placement: r.placement,
        kills: r.kills,
        placementPoints: tournament.pointsSystem?.placementPoints?.[r.placement] || 0,
        killPoints: (r.kills || 0) * (tournament.pointsSystem?.killPoints || 1),
        totalPoints: (tournament.pointsSystem?.placementPoints?.[r.placement] || 0) + 
                    ((r.kills || 0) * (tournament.pointsSystem?.killPoints || 1)),
      })),
      mapName: mapName || null,
      vodLink: vodLink || null,
    };

    if (existingGameIndex >= 0) {
      tournament.games[existingGameIndex] = gameData;
    } else {
      tournament.games.push(gameData);
    }

    // Update tournament status if all games are completed
    if (tournament.games.length >= tournament.numberOfGames && 
        tournament.games.every(g => g.status === 'completed')) {
      tournament.status = 'completed';
    } else if (tournament.status === 'locked') {
      tournament.status = 'ongoing';
    }

    await tournament.save();

    res.json({ message: 'Brackets updated successfully', tournament });
  } catch (error) {
    console.error('Update brackets error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Check-in a team for tournament (Captain only)
 * POST /api/tournaments/:id/check-in
 */
exports.checkInTeam = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.checkInSettings?.enabled) {
      return res.status(400).json({ message: 'Check-in is not enabled for this tournament' });
    }

    const now = new Date();
    if (tournament.checkInSettings.opensAt && now < tournament.checkInSettings.opensAt) {
      return res.status(400).json({ 
        message: 'Check-in has not opened yet',
        opensAt: tournament.checkInSettings.opensAt
      });
    }
    if (tournament.checkInSettings.closesAt && now > tournament.checkInSettings.closesAt) {
      return res.status(400).json({ message: 'Check-in has closed' });
    }

    const userTeamId = req.user.teamId;
    if (!userTeamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    const team = await Team.findById(userTeamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captain can check-in' });
    }

    const registration = tournament.registeredTeams.find(
      rt => rt.team.toString() === team._id.toString()
    );

    if (!registration) {
      return res.status(400).json({ message: 'Team is not registered for this tournament' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ message: 'Team is already checked-in' });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user.id;

    await tournament.save();

    res.json({ message: 'Team checked-in successfully', tournament });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Process check-in for a team (Admin/Organizer only)
 * POST /api/tournaments/:id/process-check-in
 */
exports.processCheckIn = async (req, res) => {
  try {
    const { teamId } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const registration = tournament.registeredTeams.find(
      rt => rt.team.toString() === teamId.toString()
    );

    if (!registration) {
      return res.status(404).json({ message: 'Team is not registered for this tournament' });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user.id;

    await tournament.save();

    res.json({ message: 'Check-in processed successfully', tournament });
  } catch (error) {
    console.error('Process check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Join waitlist for tournament
 * POST /api/tournaments/:id/waitlist
 */
exports.joinWaitlist = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Tournament is not open for registration' });
    }

    const user = await User.findById(req.user.id).populate('teamId');
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    const team = await Team.findById(user.teamId._id || user.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isCaptain = team.captain.toString() === req.user.id.toString();
    if (!isCaptain && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can join waitlist' });
    }

    // Check if team is already registered
    const alreadyRegistered = tournament.registeredTeams.some(
      rt => rt.team.toString() === team._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Team is already registered' });
    }

    // Check if team is already on waitlist
    const alreadyOnWaitlist = tournament.waitlist.some(
      w => w.team.toString() === team._id.toString()
    );

    if (alreadyOnWaitlist) {
      return res.status(400).json({ message: 'Team is already on waitlist' });
    }

    // Add to waitlist
    const position = tournament.waitlist.length + 1;
    tournament.waitlist.push({
      team: team._id,
      joinedAt: new Date(),
      position,
    });

    await tournament.save();

    res.json({ message: 'Team added to waitlist successfully', tournament, position });
  } catch (error) {
    console.error('Join waitlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Calculate tournament standings
 */
function calculateTournamentStandings(games, registeredTeams, tournament = null) {
  const teamTotals = {};

  // Initialize all registered teams
  registeredTeams.forEach(rt => {
    const teamId = rt.team.toString();
    teamTotals[teamId] = {
      team: rt.team,
      totalPoints: 0,
      totalKills: 0,
      totalPlacementPoints: 0,
      pointsBeforeLastGame: 0,
      placements: [],
      wins: 0,
      gamesPlayed: 0,
    };
  });

  // Process all games
  games.forEach((game, gameIndex) => {
    if (!game.results) return;

    const isLastGame = gameIndex === games.length - 1;

    game.results.forEach(result => {
      const teamId = result.team.toString();
      if (!teamTotals[teamId]) return;

      const team = teamTotals[teamId];
      team.totalPoints += result.totalPoints || 0;
      team.totalKills += result.kills || 0;
      team.totalPlacementPoints += result.placementPoints || 0;
      team.placements.push(result.placement);
      team.gamesPlayed++;

      if (result.placement === 1) {
        team.wins++;
      }

      if (!isLastGame) {
        team.pointsBeforeLastGame = team.totalPoints;
      }
    });
  });

  // Calculate standings
  const standings = Object.values(teamTotals)
    .map(team => ({
      team: team.team,
      totalPoints: team.totalPoints,
      totalKills: team.totalKills,
      totalPlacementPoints: team.totalPlacementPoints,
      pointsBeforeLastGame: team.pointsBeforeLastGame,
      avgPlacement: statsCalculator.calculateAvgPlacement(team.placements),
      wins: team.wins,
      gamesPlayed: team.gamesPlayed,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Add placement and calculate earnings
  standings.forEach((standing, index) => {
    standing.placement = index + 1;
    standing.earnings = calculateEarnings(tournament, standing.placement);
  });

  return standings;
}

/**
 * Helper: Calculate earnings for a placement
 */
function calculateEarnings(tournament, placement) {
  if (!tournament || !tournament.prizePool || tournament.prizePool <= 0) {
    return 0;
  }

  if (!tournament.prizeDistribution || tournament.prizeDistribution.length === 0) {
    return 0;
  }

  const prizeInfo = tournament.prizeDistribution.find(
    p => p.placement === placement
  );

  if (!prizeInfo) {
    return 0;
  }

  const earnings = (tournament.prizePool * prizeInfo.percentage) / 100;
  return Math.round(earnings * 100) / 100;
}
