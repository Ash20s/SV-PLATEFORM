const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

/**
 * Process qualifications for tournament groups
 * POST /api/tournaments/:id/process-qualifications/:groupOrder
 */
exports.processTournamentQualifications = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    const groupOrder = parseInt(req.params.groupOrder);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.hasQualifiers) {
      return res.status(400).json({ message: 'This tournament does not have qualifiers enabled' });
    }

    const currentGroup = tournament.qualifierGroups.find(g => g.groupOrder === groupOrder);
    if (!currentGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if all games are completed
    const allGamesCompleted = currentGroup.games.every(g => g.status === 'completed');
    if (!allGamesCompleted) {
      return res.status(400).json({ message: 'All games must be completed before processing qualifications' });
    }

    const { qualifiersPerGroup, transferNonQualified } = tournament.qualifierSettings;

    // Sort standings by totalPoints (descending)
    const sortedStandings = [...currentGroup.standings].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.avgPlacement - b.avgPlacement;
    });

    // Mark top teams as qualified and add to qualifiedTeams (for finals)
    const qualifiedTeams = sortedStandings.slice(0, qualifiersPerGroup);
    qualifiedTeams.forEach(standing => {
      const groupStanding = currentGroup.standings.find(s => 
        s.team.toString() === standing.team.toString()
      );
      if (groupStanding) {
        groupStanding.qualified = true;
      }
      
      // Add to tournament's qualifiedTeams if not already present (these go to finals)
      if (!tournament.qualifiedTeams.some(t => t.toString() === standing.team.toString())) {
        tournament.qualifiedTeams.push(standing.team);
      }
    });

    // Transfer non-qualified teams to next group ONLY if enabled AND next group is not full
    // This is for cases where you want a second chance system
    if (transferNonQualified && groupOrder < tournament.qualifierGroups.length) {
      const nextGroup = tournament.qualifierGroups.find(g => g.groupOrder === groupOrder + 1);
      if (nextGroup) {
        const nonQualifiedTeams = sortedStandings
          .slice(qualifiersPerGroup)
          .map(s => s.team);

        // Check if next group has space (respect maxTeams per lobby)
        const maxTeamsPerLobby = tournament.maxTeams || (tournament.gameMode === 'Trio' ? 12 : 10);
        const currentNextGroupSize = nextGroup.teams.length;
        const availableSlots = maxTeamsPerLobby - currentNextGroupSize;
        
        if (availableSlots > 0) {
          // Transfer teams up to available slots (only if there's space)
          const teamsToTransfer = nonQualifiedTeams.slice(0, availableSlots);
          
          teamsToTransfer.forEach(teamId => {
            if (!nextGroup.teams.some(t => t.toString() === teamId.toString())) {
              nextGroup.teams.push(teamId);
              
              if (!nextGroup.standings.some(s => s.team.toString() === teamId.toString())) {
                nextGroup.standings.push({
                  team: teamId,
                  totalPoints: 0,  // Reset points for new group
                  totalKills: 0,
                  avgPlacement: 0,
                  gamesPlayed: 0,
                  qualified: false
                });
              }
            }
          });
        }
        // If next group is full or no space, non-qualified teams are simply eliminated
        // They don't go to finals, they're out
      }
    }

    await tournament.save();

    // Calculate transferred and eliminated counts
    let transferredCount = 0;
    let eliminatedCount = 0;
    const nonQualifiedCount = sortedStandings.length - qualifiersPerGroup;
    
    if (transferNonQualified && groupOrder < tournament.qualifierGroups.length) {
      const nextGroup = tournament.qualifierGroups.find(g => g.groupOrder === groupOrder + 1);
      if (nextGroup) {
        const maxTeamsPerLobby = tournament.maxTeams || (tournament.gameMode === 'Trio' ? 12 : 10);
        const currentNextGroupSize = nextGroup.teams.length;
        const availableSlots = maxTeamsPerLobby - currentNextGroupSize;
        transferredCount = Math.min(nonQualifiedCount, Math.max(0, availableSlots));
        eliminatedCount = Math.max(0, nonQualifiedCount - transferredCount);
      } else {
        eliminatedCount = nonQualifiedCount;
      }
    } else {
      // If transfer is disabled, all non-qualified teams are eliminated
      eliminatedCount = nonQualifiedCount;
    }

    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('qualifierGroups.teams', 'name tag logo')
      .populate('qualifierGroups.standings.team', 'name tag')
      .populate('qualifiedTeams', 'name tag logo');

    res.json({ 
      message: 'Qualifications processed successfully', 
      tournament: populatedTournament,
      qualifiedCount: qualifiedTeams.length,
      transferredCount: transferredCount,
      eliminatedCount: eliminatedCount
    });
  } catch (error) {
    console.error('Process tournament qualifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

