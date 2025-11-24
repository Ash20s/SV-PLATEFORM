const Team = require('../models/Team');
const TeamStats = require('../models/TeamStats');
const PlayerStats = require('../models/PlayerStats');
const Match = require('../models/Match');
const TeamMapping = require('../models/TeamMapping');
const Player = require('../models/Player');
const statsCalculator = require('./statsCalculator');

/**
 * Service pour recalculer les stats d'une équipe et de ses joueurs
 * à partir de tous les matches disponibles
 */
class StatsRecalculator {
  /**
   * Recalcule les stats d'une équipe à partir de tous ses matches
   */
  async recalculateTeamStats(teamId) {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Trouver tous les matches de l'équipe via TeamMapping
      const teamMappings = await TeamMapping.find({ ourTeamId: teamId })
        .populate('matchId')
        .sort({ matchDate: 1 });

      if (teamMappings.length === 0) {
        // Pas de matches, créer des stats vides
        let teamStats = await TeamStats.findOne({ team: teamId, period: 'alltime' });
        if (!teamStats) {
          teamStats = await TeamStats.create({
            team: teamId,
            period: 'alltime',
          });
        }
        return teamStats;
      }

      // Agrégation des stats depuis tous les matches
      const placements = [];
      let totalKills = 0;
      let totalPoints = 0;
      let top1 = 0, top3 = 0, top5 = 0, top10 = 0;

      for (const mapping of teamMappings) {
        if (!mapping.matchId) continue;

        const match = await Match.findById(mapping.matchId);
        if (!match) continue;

        const placement = mapping.placement;
        placements.push(placement);

        // Calculer les kills totaux de l'équipe dans ce match
        const teamPlayerIds = team.roster.map(r => r.player.toString());
        const teamKills = match.playerStats
          .filter(ps => teamPlayerIds.includes(ps.player.toString()))
          .reduce((sum, ps) => sum + (ps.kills || 0), 0);

        totalKills += teamKills;

        // Calculer les points (si disponible)
        if (match.teamStats && match.teamStats.length > 0) {
          const teamMatchStats = match.teamStats.find(
            ts => ts.team.toString() === teamId.toString()
          );
          if (teamMatchStats) {
            totalPoints += teamMatchStats.totalPoints || 0;
          }
        }

        // Compter les top placements
        if (placement === 1) top1++;
        if (placement <= 3) top3++;
        if (placement <= 5) top5++;
        if (placement <= 10) top10++;
      }

      const gamesPlayed = placements.length;
      const avgPlacement = placements.length > 0
        ? placements.reduce((sum, p) => sum + p, 0) / placements.length
        : 0;

      // Créer ou mettre à jour TeamStats
      let teamStats = await TeamStats.findOne({ team: teamId, period: 'alltime' });
      
      const statsData = {
        gamesPlayed,
        totalKills,
        avgKillsPerGame: gamesPlayed > 0 ? parseFloat((totalKills / gamesPlayed).toFixed(2)) : 0,
        top1,
        top3,
        top5,
        top10,
        avgPlacement: parseFloat(avgPlacement.toFixed(2)),
        totalPoints,
        winrate: statsCalculator.calculateWinrate(top1, gamesPlayed),
        top3Rate: statsCalculator.calculateTop3Rate(top3, gamesPlayed),
        updatedAt: new Date(),
      };

      if (teamStats) {
        Object.assign(teamStats, statsData);
        await teamStats.save();
      } else {
        teamStats = await TeamStats.create({
          team: teamId,
          period: 'alltime',
          ...statsData,
        });
      }

      return teamStats;
    } catch (error) {
      console.error(`Error recalculating team stats for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Recalcule les stats d'un joueur à partir de tous ses matches
   * @param {string} userId - L'ID de l'utilisateur (User, pas Player)
   */
  async recalculatePlayerStats(userId) {
    try {
      // Trouver le Player associé à cet User
      const player = await Player.findOne({ user: userId });
      if (!player) {
        throw new Error('Player not found for this user');
      }

      // Trouver tous les matches du joueur (playerStats.player fait référence à User)
      const matches = await Match.find({
        'playerStats.player': userId,
        syncStatus: 'synced',
      });

      if (matches.length === 0) {
        // Pas de matches, créer des stats vides
        let playerStats = await PlayerStats.findOne({ player: player._id, period: 'alltime' });
        if (!playerStats) {
          playerStats = await PlayerStats.create({
            player: player._id,
            period: 'alltime',
          });
        }
        return playerStats;
      }

      // Agrégation des stats
      let gamesPlayed = 0;
      let kills = 0, deaths = 0, assists = 0;
      let totalDamage = 0;
      let top1 = 0, top3 = 0, top5 = 0, top10 = 0;
      const placements = [];

      for (const match of matches) {
        const playerStat = match.playerStats.find(
          ps => ps.player.toString() === userId.toString()
        );

        if (!playerStat) continue;

        gamesPlayed++;
        kills += playerStat.kills || 0;
        deaths += playerStat.deaths || 0;
        assists += playerStat.assists || 0;
        totalDamage += playerStat.damageDealt || 0;

        const placement = playerStat.finalPosition;
        placements.push(placement);

        if (placement === 1) top1++;
        if (placement <= 3) top3++;
        if (placement <= 5) top5++;
        if (placement <= 10) top10++;
      }

      // Créer ou mettre à jour PlayerStats
      let playerStats = await PlayerStats.findOne({ player: player._id, period: 'alltime' });

      const statsData = {
        gamesPlayed,
        kills,
        deaths,
        assists,
        totalDamage,
        top1,
        top3,
        top5,
        top10,
        kda: statsCalculator.calculateKDA(kills, deaths, assists),
        winrate: statsCalculator.calculateWinrate(top1, gamesPlayed),
        avgDamage: gamesPlayed > 0 ? Math.round(totalDamage / gamesPlayed) : 0,
        killsPerGame: statsCalculator.calculateKillsPerGame(kills, gamesPlayed),
        avgPlacement: placements.length > 0
          ? parseFloat((placements.reduce((sum, p) => sum + p, 0) / placements.length).toFixed(2))
          : 0,
        updatedAt: new Date(),
      };

      if (playerStats) {
        Object.assign(playerStats, statsData);
        await playerStats.save();
      } else {
        playerStats = await PlayerStats.create({
          player: player._id,
          period: 'alltime',
          ...statsData,
        });
      }

      return playerStats;
    } catch (error) {
      console.error(`Error recalculating player stats for ${playerId}:`, error);
      throw error;
    }
  }

  /**
   * Recalcule les stats d'une équipe et de tous ses joueurs
   */
  async recalculateTeamAndPlayers(teamId) {
    try {
      const team = await Team.findById(teamId).populate('roster.player');
      if (!team) {
        throw new Error('Team not found');
      }

      // Recalculer les stats de l'équipe
      const teamStats = await this.recalculateTeamStats(teamId);

      // Recalculer les stats de tous les joueurs de l'équipe
      // roster.player fait référence à User directement
      const playerStatsPromises = team.roster.map(rosterEntry => {
        if (rosterEntry.player) {
          const userId = rosterEntry.player._id || rosterEntry.player;
          return this.recalculatePlayerStats(userId).catch(err => {
            console.error(`Error recalculating stats for player ${userId}:`, err);
            return null;
          });
        }
        return Promise.resolve(null);
      });

      await Promise.all(playerStatsPromises);

      return {
        teamStats,
        message: `Stats recalculated for team and ${team.roster.length} players`,
      };
    } catch (error) {
      console.error(`Error recalculating team and players for ${teamId}:`, error);
      throw error;
    }
  }
}

module.exports = new StatsRecalculator();

