const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

// Générer automatiquement les groupes de qualification
exports.generateQualifierGroups = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('registeredTeams.team', 'name tag logo');  // Seulement les champs nécessaires

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.hasQualifiers) {
      return res.status(400).json({ message: 'This tournament does not have qualifiers enabled' });
    }

    if (tournament.qualifierGroups && tournament.qualifierGroups.length > 0) {
      return res.status(400).json({ message: 'Groups have already been generated' });
    }

    const { numberOfGroups: requestedNumberOfGroups, teamsPerGroup, gamesPerGroup, qualifiersPerGroup: requestedQualifiersPerGroup } = tournament.qualifierSettings;
    const teams = tournament.registeredTeams.map(rt => rt.team);
    // Use tournament.maxTeams if set, otherwise default based on gameMode
    const maxTeamsPerLobby = tournament.maxTeams || (tournament.gameMode === 'Trio' ? 12 : 10);
    const totalTeams = teams.length;

    // Validate minimum teams
    if (totalTeams < 2) {
      return res.status(400).json({ 
        message: `Not enough teams. Need at least 2 teams.` 
      });
    }

    // ===== CALCUL AUTOMATIQUE INTELLIGENT =====
    // 1. Calculer le nombre de lobbies nécessaires
    const fullLobbies = Math.floor(totalTeams / maxTeamsPerLobby);
    const remainingTeams = totalTeams % maxTeamsPerLobby;
    
    // Déterminer si on a besoin du système de transfert
    // Si on a des équipes restantes qui ne remplissent pas un lobby complet, on active le transfert
    const needsTransfer = remainingTeams > 0 && remainingTeams < maxTeamsPerLobby;
    
    // Calculer le nombre réel de lobbies
    let actualNumberOfGroups;
    if (requestedNumberOfGroups && requestedNumberOfGroups > 0) {
      // Si l'organisateur a spécifié un nombre, on l'utilise (mais on valide)
      actualNumberOfGroups = Math.min(requestedNumberOfGroups, Math.ceil(totalTeams / maxTeamsPerLobby));
    } else {
      // Sinon, calculer automatiquement
      if (needsTransfer) {
        // Si on a besoin de transfert, on crée les lobbies complets + 1 pour le transfert
        actualNumberOfGroups = fullLobbies + 1;
      } else {
        // Sinon, on crée juste le nombre de lobbies complets nécessaires
        actualNumberOfGroups = fullLobbies || 1; // Au moins 1 lobby
      }
    }

    // 2. Calculer automatiquement qualifiersPerGroup pour remplir la finale
    let actualQualifiersPerGroup;
    if (requestedQualifiersPerGroup && requestedQualifiersPerGroup > 0) {
      // Si l'organisateur a spécifié, on l'utilise (mais on valide)
      actualQualifiersPerGroup = requestedQualifiersPerGroup;
    } else {
      // Sinon, calculer pour remplir la finale (maxTeamsPerLobby)
      // Objectif : remplir la finale avec maxTeamsPerLobby équipes
      if (fullLobbies >= 2 && !needsTransfer) {
        // Cas idéal : plusieurs lobbies complets sans reste, on divise équitablement
        // Exemple : 24 équipes, maxTeams=12 → 2 lobbies → 6 qualifiés chacun = 12 en finale
        actualQualifiersPerGroup = Math.floor(maxTeamsPerLobby / fullLobbies);
      } else if (fullLobbies >= 1 && needsTransfer) {
        // Cas avec transfert : on a des lobbies complets + un lobby partiel
        // Exemple : 25 équipes, maxTeams=12 → 2 lobbies complets + 1 équipe
        // On qualifie la moitié de chaque lobby complet, le reste va au lobby de transfert
        actualQualifiersPerGroup = Math.floor(maxTeamsPerLobby / 2);
      } else {
        // Cas simple : 1 seul lobby ou moins de maxTeamsPerLobby équipes
        // On qualifie la moitié (arrondi vers le bas)
        actualQualifiersPerGroup = Math.floor(maxTeamsPerLobby / 2);
      }
      // S'assurer qu'on a au moins 1 qualifié par groupe et pas plus que maxTeamsPerLobby
      actualQualifiersPerGroup = Math.max(1, Math.min(actualQualifiersPerGroup, maxTeamsPerLobby));
    }

    // 3. Activer automatiquement transferNonQualified si nécessaire
    if (needsTransfer && !tournament.qualifierSettings.transferNonQualified) {
      tournament.qualifierSettings.transferNonQualified = true;
    }

    // Mettre à jour les settings calculés
    tournament.qualifierSettings.numberOfGroups = actualNumberOfGroups;
    tournament.qualifierSettings.qualifiersPerGroup = actualQualifiersPerGroup;

    // Shuffle teams pour distribution aléatoire
    const shuffledTeams = teams.sort(() => Math.random() - 0.5);

    // Créer les groupes
    const groups = [];
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    // Distribuer les équipes dans les lobbies
    let teamIndex = 0;
    for (let i = 0; i < actualNumberOfGroups; i++) {
      const isLastGroup = i === actualNumberOfGroups - 1;
      let groupTeams = [];
      
      if (isLastGroup && needsTransfer) {
        // Dernier lobby : prendre les équipes restantes (sera complété par transfert)
        groupTeams = shuffledTeams.slice(teamIndex, teamIndex + remainingTeams);
        teamIndex += remainingTeams;
      } else {
        // Lobby complet : prendre maxTeamsPerLobby équipes
        const teamsToTake = Math.min(maxTeamsPerLobby, shuffledTeams.length - teamIndex);
        groupTeams = shuffledTeams.slice(teamIndex, teamIndex + teamsToTake);
        teamIndex += teamsToTake;
      }
      
      // Créer les games pour ce groupe (sans populate initial)
      const actualGamesPerGroup = gamesPerGroup || 3;
      const groupGames = [];
      for (let j = 1; j <= actualGamesPerGroup; j++) {
        groupGames.push({
          gameNumber: j,
          status: 'scheduled',
          results: []
        });
      }

      // Créer le standing initial pour chaque équipe
      const groupStandings = groupTeams.map(team => ({
        team: team._id,
        totalPoints: 0,
        totalKills: 0,
        avgPlacement: 0,
        gamesPlayed: 0,
        qualified: false
      }));

      groups.push({
        groupName: `Group ${groupLetters[i]}`,
        groupOrder: i + 1,  // Add order for transfer logic
        teams: groupTeams.map(t => t._id),
        games: groupGames,
        standings: groupStandings
      });
    }

    // Log pour debug
    console.log(`[Qualifier] Calcul automatique:`);
    console.log(`  - Total équipes: ${totalTeams}`);
    console.log(`  - Max teams par lobby: ${maxTeamsPerLobby}`);
    console.log(`  - Lobbies complets: ${fullLobbies}`);
    console.log(`  - Équipes restantes: ${remainingTeams}`);
    console.log(`  - Besoin transfert: ${needsTransfer}`);
    console.log(`  - Nombre de lobbies: ${actualNumberOfGroups}`);
    console.log(`  - Qualifiés par lobby: ${actualQualifiersPerGroup}`);
    console.log(`  - Total qualifiés finale: ${actualNumberOfGroups * actualQualifiersPerGroup}`);

    tournament.qualifierGroups = groups;
    await tournament.save();

    // Populate seulement les champs nécessaires
    const populatedTournament = await Tournament.findById(tournament._id)
      .select('name hasQualifiers qualifierSettings qualifierGroups qualifiedTeams')
      .populate('qualifierGroups.teams', 'name tag logo')
      .populate('qualifierGroups.standings.team', 'name tag')
      .lean();  // Retourne des objets JavaScript plain au lieu de documents Mongoose

    res.json(populatedTournament);
  } catch (error) {
    console.error('Generate groups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mettre à jour les résultats d'un game de qualification
exports.updateQualifierGameResults = async (req, res) => {
  try {
    const { tournamentId, groupId, gameId } = req.params;
    const { results } = req.body;

    const tournament = await Tournament.findById(tournamentId)
      .select('hasQualifiers qualifierSettings qualifierGroups qualifiedTeams pointsSystem');
      
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const group = tournament.qualifierGroups.id(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const game = group.games.id(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Mettre à jour les résultats du game
    game.results = results.map(r => ({
      team: r.team,
      placement: r.placement,
      kills: r.kills,
      placementPoints: tournament.pointsSystem.placement[r.placement] || 0,
      killPoints: r.kills * tournament.pointsSystem.killPoints,
      totalPoints: (tournament.pointsSystem.placement[r.placement] || 0) + (r.kills * tournament.pointsSystem.killPoints)
    }));
    game.status = 'completed';

    // Recalculer les standings du groupe (optimisé)
    const teamStats = new Map();
    
    group.games.forEach(g => {
      if (g.status === 'completed') {
        g.results.forEach(result => {
          const teamId = result.team.toString();
          if (!teamStats.has(teamId)) {
            teamStats.set(teamId, {
              totalPoints: 0,
              totalKills: 0,
              placements: [],
              gamesPlayed: 0
            });
          }
          const stats = teamStats.get(teamId);
          stats.totalPoints += result.totalPoints;
          stats.totalKills += result.kills;
          stats.placements.push(result.placement);
          stats.gamesPlayed += 1;
        });
      }
    });

    // Mettre à jour les standings
    group.standings = group.teams.map(teamId => {
      const stats = teamStats.get(teamId.toString()) || {
        totalPoints: 0,
        totalKills: 0,
        placements: [],
        gamesPlayed: 0
      };
      
      return {
        team: teamId,
        totalPoints: stats.totalPoints,
        totalKills: stats.totalKills,
        avgPlacement: stats.placements.length > 0 
          ? stats.placements.reduce((a, b) => a + b, 0) / stats.placements.length 
          : 0,
        gamesPlayed: stats.gamesPlayed,
        qualified: false
      };
    });

    // Trier par points et marquer les qualifiés
    group.standings.sort((a, b) => b.totalPoints - a.totalPoints);
    for (let i = 0; i < tournament.qualifierSettings.qualifiersPerGroup && i < group.standings.length; i++) {
      group.standings[i].qualified = true;
    }

    await tournament.save();

    // Mettre à jour la liste des équipes qualifiées globale
    const qualifiedTeams = [];
    tournament.qualifierGroups.forEach(g => {
      g.standings.forEach(s => {
        if (s.qualified) {
          qualifiedTeams.push(s.team);
        }
      });
    });
    tournament.qualifiedTeams = qualifiedTeams;
    await tournament.save();

    // Populate uniquement ce qui est nécessaire + lean pour performance
    const populatedTournament = await Tournament.findById(tournament._id)
      .select('name hasQualifiers qualifierSettings qualifierGroups qualifiedTeams')
      .populate('qualifierGroups.teams', 'name tag logo')
      .populate('qualifierGroups.standings.team', 'name tag')
      .populate('qualifiedTeams', 'name tag logo')
      .lean();

    res.json(populatedTournament);
  } catch (error) {
    console.error('Update game results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
