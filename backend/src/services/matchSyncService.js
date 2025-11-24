// Service de synchronisation des matches Supervive avec notre DB
// Gère le mapping des équipes et le scoring automatique

const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const TeamMapping = require('../models/TeamMapping');
const User = require('../models/User');
const superviveAPI = require('./superviveAPI');
const statsCalculator = require('./statsCalculator');
const prizeCalculator = require('./prizeCalculator');

class MatchSyncService {
  /**
   * Synchronise un match depuis l'API Supervive vers notre DB
   * @param {Object} normalizedMatch - Match normalisé depuis l'API
   * @param {Object} options - Options (tournament, scrim, etc.)
   * @returns {Promise<Object>} Match créé/mis à jour
   */
  async syncMatch(normalizedMatch, options = {}) {
    try {
      // Vérifier si le match existe déjà
      const existingMatch = await Match.findOne({ 
        gameMatchId: normalizedMatch.matchId 
      });

      if (existingMatch && existingMatch.syncStatus === 'synced') {
        console.log(`Match ${normalizedMatch.matchId} already synced`);
        return existingMatch;
      }

      // Mapper les joueurs Supervive vers nos joueurs
      const playerMappings = await this.mapPlayers(normalizedMatch.playerStats);

      // Mapper les équipes Supervive vers nos équipes
      const teamMappings = await this.mapTeams(normalizedMatch, playerMappings);

      // Créer les stats de joueurs pour le match
      const playerStats = await this.createPlayerStats(
        normalizedMatch,
        playerMappings,
        teamMappings
      );

      // Créer ou mettre à jour le match
      const matchData = {
        gameMatchId: normalizedMatch.matchId,
        matchType: options.matchType || 'casual',
        tournament: options.tournament || null,
        scrim: options.scrim || null,
        startedAt: normalizedMatch.matchStart,
        endedAt: normalizedMatch.matchEnd,
        duration: Math.floor((normalizedMatch.matchEnd - normalizedMatch.matchStart) / 1000),
        playerStats,
        map: normalizedMatch.region || 'unknown',
        gameMode: 'battle_royale',
        totalPlayers: normalizedMatch.numParticipants,
        rawData: normalizedMatch.rawData,
        syncStatus: 'synced'
      };

      const match = existingMatch
        ? await Match.findByIdAndUpdate(existingMatch._id, matchData, { new: true })
        : await Match.create(matchData);

      // Si c'est un match de tournoi/scrim, calculer le scoring
      if (options.tournament || options.scrim) {
        await this.calculateScoring(match, normalizedMatch, teamMappings, options);
      }

      // Mettre à jour les statistiques des joueurs
      await this.updatePlayerStats(match);

      console.log(`Match ${normalizedMatch.matchId} synced successfully`);
      return match;
    } catch (error) {
      console.error(`Error syncing match ${normalizedMatch.matchId}:`, error);
      
      // Enregistrer l'erreur dans le match si il existe
      if (normalizedMatch.matchId) {
        await Match.findOneAndUpdate(
          { gameMatchId: normalizedMatch.matchId },
          { 
            syncStatus: 'error',
            syncError: error.message 
          },
          { upsert: true }
        );
      }
      
      throw error;
    }
  }

  /**
   * Mappe les joueurs Supervive vers nos joueurs dans la DB
   */
  async mapPlayers(playerStats) {
    const mappings = {};

    for (const playerStat of playerStats) {
      // Chercher le joueur par Supervive PlayerID ou Tag
      let player = await Player.findOne({
        $or: [
          { supervivePlayerId: playerStat.playerId },
          { 'user.superviveTag': playerStat.tag }
        ]
      }).populate('user');

      // Si pas trouvé, chercher par User tag
      if (!player && playerStat.tag) {
        const user = await User.findOne({ 
          'profile.superviveTag': playerStat.tag 
        });
        if (user) {
          player = await Player.findOne({ user: user._id });
        }
      }

      mappings[playerStat.supervivePlayerId] = {
        player,
        superviveData: playerStat
      };
    }

    return mappings;
  }

  /**
   * Mappe les équipes Supervive vers nos équipes dans la DB
   */
  async mapTeams(normalizedMatch, playerMappings) {
    const teamMappings = {};
    const matchDate = normalizedMatch.matchStart;

    // Grouper les joueurs par équipe Supervive
    const teamsBySuperviveId = {};
    for (const [playerId, mapping] of Object.entries(playerMappings)) {
      if (mapping.player && mapping.superviveData.superviveTeamId) {
        const superviveTeamId = mapping.superviveData.superviveTeamId;
        if (!teamsBySuperviveId[superviveTeamId]) {
          teamsBySuperviveId[superviveTeamId] = [];
        }
        teamsBySuperviveId[superviveTeamId].push(mapping.player);
      }
    }

    // Pour chaque équipe Supervive, trouver notre équipe correspondante
    for (const [superviveTeamId, players] of Object.entries(teamsBySuperviveId)) {
      // Chercher un mapping existant récent
      const existingMapping = await TeamMapping.findLatestMapping(
        superviveTeamId,
        matchDate
      );

      if (existingMapping) {
        teamMappings[superviveTeamId] = existingMapping.ourTeamId;
      } else {
        // Essayer de trouver l'équipe basée sur les joueurs
        const ourTeam = await this.findTeamByPlayers(players);
        
        if (ourTeam) {
          // Créer un nouveau mapping
          const placement = normalizedMatch.teamPlacements.find(
            t => t.superviveTeamId === superviveTeamId
          )?.placement || 0;

          await TeamMapping.create({
            superviveTeamId,
            ourTeamId: ourTeam._id,
            matchId: null, // Sera mis à jour après création du match
            supervivePlayerIds: players.map(p => p.supervivePlayerId || p._id.toString()),
            placement,
            matchDate,
            confidence: this.calculateConfidence(players, ourTeam)
          });

          teamMappings[superviveTeamId] = ourTeam._id;
        }
      }
    }

    return teamMappings;
  }

  /**
   * Trouve une équipe basée sur ses joueurs
   */
  async findTeamByPlayers(players) {
    if (players.length === 0) return null;

    // Chercher une équipe qui contient tous ces joueurs
    const playerIds = players.map(p => p._id);
    
    const team = await Team.findOne({
      'roster.player': { $all: playerIds }
    });

    return team;
  }

  /**
   * Calcule la confiance d'un mapping (0-1)
   */
  calculateConfidence(players, team) {
    if (!team || !team.roster) return 0;

    const teamPlayerIds = new Set(
      team.roster.map(r => r.player.toString())
    );
    const matchCount = players.filter(p => 
      teamPlayerIds.has(p._id.toString())
    ).length;

    return matchCount / Math.max(players.length, team.roster.length);
  }

  /**
   * Crée les stats de joueurs pour un match
   */
  async createPlayerStats(normalizedMatch, playerMappings, teamMappings) {
    const playerStats = [];

    for (const [playerId, mapping] of Object.entries(playerMappings)) {
      if (!mapping.player) continue;

      const superviveData = mapping.superviveData;
      const stats = superviveData.stats;
      const ourTeamId = teamMappings[superviveData.superviveTeamId];

      playerStats.push({
        player: mapping.player.user || mapping.player._id,
        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
        revives: stats.revives,
        revived: stats.revived,
        damageDealt: stats.damageDone,
        damageTaken: stats.damageTaken,
        healing: stats.healingGiven,
        finalPosition: superviveData.placement,
        hunter: superviveData.heroAssetId,
        survivalTime: superviveData.survivalDuration,
        superviveTeamId: superviveData.superviveTeamId,
        ourTeamId: ourTeamId
      });
    }

    return playerStats;
  }

  /**
   * Calcule le scoring pour un match de tournoi/scrim
   */
  async calculateScoring(match, normalizedMatch, teamMappings, options) {
    if (options.tournament) {
      const Tournament = require('../models/Tournament');
      const tournament = await Tournament.findById(options.tournament)
        .populate('registeredTeams.team');

      if (!tournament) return;

      // Calculer les points pour chaque équipe
      for (const teamPlacement of normalizedMatch.teamPlacements) {
        const ourTeamId = teamMappings[teamPlacement.superviveTeamId];
        if (!ourTeamId) continue;

        const points = prizeCalculator.calculatePoints(
          teamPlacement.placement,
          normalizedMatch.playerStats
            .filter(p => p.superviveTeamId === teamPlacement.superviveTeamId)
            .reduce((sum, p) => sum + p.stats.kills, 0),
          tournament.pointsSystem
        );

        // Mettre à jour les standings du tournoi
        // (logique à implémenter selon votre système de standings)
      }
    }
  }

  /**
   * Met à jour les statistiques des joueurs après un match
   */
  async updatePlayerStats(match) {
    const PlayerStats = require('../models/PlayerStats');

    for (const playerStat of match.playerStats) {
      const player = await Player.findOne({ user: playerStat.player });
      if (!player) continue;

      let stats = await PlayerStats.findOne({ player: player._id });
      if (!stats) {
        stats = await PlayerStats.create({ player: player._id });
      }

      const updatedStats = statsCalculator.updatePlayerStats(stats, {
        kills: playerStat.kills,
        deaths: playerStat.deaths,
        assists: playerStat.assists,
        damage: playerStat.damageDealt,
        placement: playerStat.finalPosition
      });

      await PlayerStats.findByIdAndUpdate(stats._id, updatedStats);
    }
  }
}

module.exports = new MatchSyncService();

