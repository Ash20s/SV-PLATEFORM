// Supervive API Service - Intégration avec l'API officielle
// Basé sur les spécifications de Zendrex (Dev Supervive)

let axios;
try {
  axios = require('axios');
} catch (error) {
  console.warn('⚠️  Axios not available. Will use mock mode only.');
  axios = null;
}

const SUPERVIVE_API_BASE = process.env.SUPERVIVE_API_URL || 'https://api.supervive.com/v1';
const API_KEY = process.env.SUPERVIVE_API_KEY;
const POLL_INTERVAL = parseInt(process.env.SUPERVIVE_POLL_INTERVAL) || 300000; // 5 minutes par défaut
const USE_MOCK = process.env.SUPERVIVE_USE_MOCK === 'true' || !API_KEY || !axios;

class SuperviveAPIService {
  constructor() {
    this.useMock = USE_MOCK;
    
    if (this.useMock) {
      console.log('🔧 Using MOCK Supervive API (no real API key provided)');
      this.mockService = require('./superviveAPIMock');
    } else if (axios) {
      this.client = axios.create({
        baseURL: SUPERVIVE_API_BASE,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 secondes timeout
      });
    } else {
      console.warn('⚠️  Axios not available, forcing mock mode');
      this.useMock = true;
      this.mockService = require('./superviveAPIMock');
    }
    
    this.lastPollTime = null;
    this.isPolling = false;
  }

  /**
   * Récupère les matches récents depuis l'API Supervive
   * @param {Date} since - Date depuis laquelle récupérer les matches
   * @param {number} limit - Nombre maximum de matches à récupérer
   * @returns {Promise<Array>} Liste des matches
   */
  async getMatches(since = null, limit = 50) {
    if (this.useMock) {
      return await this.mockService.getMatches(since, limit);
    }

    try {
      const params = { limit };
      if (since) {
        params.since = since.toISOString();
      }

      const response = await this.client.get('/matches', { params });
      return response.data.matches || [];
    } catch (error) {
      console.error('Error fetching matches from Supervive API:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Récupère les détails complets d'un match
   * @param {string} matchId - ID du match Supervive
   * @returns {Promise<Object|null>} Données du match ou null si erreur
   */
  async getMatchDetails(matchId) {
    if (this.useMock) {
      try {
        return await this.mockService.getMatchDetails(matchId);
      } catch (error) {
        console.error(`Error fetching match ${matchId}:`, error.message);
        return null;
      }
    }

    try {
      const response = await this.client.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error.message);
      return null;
    }
  }

  /**
   * Normalise les données d'un match Supervive vers notre format
   * @param {Object} apiMatch - Données brutes de l'API
   * @returns {Object} Match normalisé
   */
  normalizeMatch(apiMatch) {
    const matchDetails = apiMatch.MatchDetails || {};
    const playerMatchDetails = apiMatch.PlayerMatchDetails || {};
    const teamMatchDetails = apiMatch.TeamMatchDetails || [];

    // Extraire les stats des joueurs
    const playerStats = Object.entries(playerMatchDetails).map(([playerId, playerData]) => {
      const stats = playerData.PlayerMatchStats || {};
      return {
        supervivePlayerId: playerId,
        playerId: playerData.PlayerID,
        displayName: playerData.DisplayName,
        tag: playerData.Tag,
        heroAssetId: playerData.HeroAssetID,
        superviveTeamId: playerData.TeamID,
        placement: playerData.Placement || 0,
        survivalDuration: playerData.SurvivalDuration || 0,
        characterLevel: playerData.CharacterLevel || 1,
        stats: {
          kills: stats.Kills || 0,
          deaths: stats.Deaths || 0,
          assists: stats.Assists || 0,
          damageDone: stats.DamageDone || 0,
          damageTaken: stats.DamageTaken || 0,
          effectiveDamageDone: stats.EffectiveDamageDone || 0,
          effectiveDamageTaken: stats.EffectiveDamageTaken || 0,
          healingGiven: stats.HealingGiven || 0,
          healingReceived: stats.HealingReceived || 0,
          heroDamageDone: stats.HeroDamageDone || 0,
          heroDamageTaken: stats.HeroDamageTaken || 0,
          knocked: stats.Knocked || 0,
          knocks: stats.Knocks || 0,
          revived: stats.Revived || 0,
          revives: stats.Revives || 0,
          resurrected: stats.Resurrected || 0,
          resurrects: stats.Resurrects || 0,
          maxKillStreak: stats.MaxKillStreak || 0,
          maxKnockStreak: stats.MaxKnockStreak || 0,
          armorMitigatedDamage: stats.ArmorMitigatedDamage || 0,
          shieldMitigatedDamage: stats.ShieldMitigatedDamage || 0,
          creepKills: stats.CreepKills || 0,
          goldFromEnemies: stats.GoldFromEnemies || 0,
          goldFromMonsters: stats.GoldFromMonsters || 0,
          goldFromTreasure: stats.GoldFromTreasure || 0,
        }
      };
    });

    // Extraire les placements des équipes
    const teamPlacements = teamMatchDetails.map(team => ({
      superviveTeamId: team.TeamID,
      placement: team.Placement
    }));

    return {
      matchId: apiMatch.MatchID,
      matchStart: new Date(matchDetails.MatchStart),
      matchEnd: new Date(matchDetails.MatchEnd),
      numParticipants: matchDetails.NumParticipants || 0,
      numTeams: matchDetails.NumTeams || 0,
      maxTeamSize: matchDetails.MaxTeamSize || 1,
      region: matchDetails.ConnectionDetails?.Region || 'unknown',
      participants: matchDetails.Participants || [],
      playerStats,
      teamPlacements,
      rawData: apiMatch // Garder les données brutes pour référence
    };
  }

  /**
   * Trouve le gagnant d'un match (équipe avec placement 1)
   */
  getWinnerTeam(normalizedMatch) {
    const winner = normalizedMatch.teamPlacements.find(t => t.placement === 1);
    if (!winner) return null;

    // Trouver les joueurs de l'équipe gagnante
    const winnerPlayers = normalizedMatch.playerStats.filter(
      p => p.superviveTeamId === winner.superviveTeamId
    );

    return {
      superviveTeamId: winner.superviveTeamId,
      placement: 1,
      players: winnerPlayers
    };
  }

  /**
   * Calcule les statistiques agrégées pour un joueur
   * @param {Array} matches - Liste de matches normalisés
   * @param {string} supervivePlayerId - ID du joueur Supervive
   * @returns {Object} Statistiques agrégées
   */
  calculatePlayerProfile(matches, supervivePlayerId) {
    const playerMatches = matches
      .flatMap(m => m.playerStats)
      .filter(p => p.supervivePlayerId === supervivePlayerId);

    if (playerMatches.length === 0) {
      return null;
    }

    const totalMatches = playerMatches.length;
    const totalKills = playerMatches.reduce((sum, p) => sum + p.stats.kills, 0);
    const totalDeaths = playerMatches.reduce((sum, p) => sum + p.stats.deaths, 0);
    const totalAssists = playerMatches.reduce((sum, p) => sum + p.stats.assists, 0);
    const totalDamage = playerMatches.reduce((sum, p) => sum + p.stats.damageDone, 0);
    const totalWins = playerMatches.filter(p => p.placement === 1).length;
    const avgPlacement = playerMatches.reduce((sum, p) => sum + p.placement, 0) / totalMatches;
    const avgKills = totalKills / totalMatches;
    const kda = totalDeaths === 0 ? totalKills + totalAssists : (totalKills + totalAssists) / totalDeaths;

    return {
      playerId: playerMatches[0].playerId,
      playerName: playerMatches[0].displayName,
      totalMatches,
      totalWins,
      averagePlacement: parseFloat(avgPlacement.toFixed(2)),
      averageKills: parseFloat(avgKills.toFixed(2)),
      totalKills,
      totalDeaths,
      totalAssists,
      totalDamage,
      kdaRatio: parseFloat(kda.toFixed(2))
    };
  }

  /**
   * Démarre le polling automatique pour récupérer les nouveaux matches
   * @param {Function} onNewMatch - Callback appelé quand un nouveau match est trouvé
   */
  startPolling(onNewMatch) {
    if (this.isPolling) {
      console.log('Polling already started');
      return;
    }

    this.isPolling = true;
    console.log(`Starting Supervive API polling (interval: ${POLL_INTERVAL}ms)`);

    const poll = async () => {
      try {
        const since = this.lastPollTime || new Date(Date.now() - 24 * 60 * 60 * 1000); // Dernières 24h
        const matches = await this.getMatches(since);

        if (matches.length > 0) {
          console.log(`Found ${matches.length} new matches`);
          
          for (const match of matches) {
            const details = await this.getMatchDetails(match.MatchID || match.matchId);
            if (details) {
              const normalized = this.normalizeMatch(details);
              await onNewMatch(normalized);
            }
          }
        }

        this.lastPollTime = new Date();
      } catch (error) {
        console.error('Error in polling:', error.message);
      }
    };

    // Premier poll immédiat
    poll();

    // Puis polling régulier
    this.pollInterval = setInterval(poll, POLL_INTERVAL);
  }

  /**
   * Arrête le polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isPolling = false;
      console.log('Stopped Supervive API polling');
    }
  }
}

module.exports = new SuperviveAPIService();
