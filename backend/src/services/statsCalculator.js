// Stats calculator service - Battle Royale specific calculations
module.exports = {
  /**
   * Calculate ELO rating based on placement and kills
   * @param {number} currentElo - Current ELO rating
   * @param {number} placement - Match placement (1-20)
   * @param {number} kills - Number of kills
   * @param {number} totalTeams - Total teams in match
   * @returns {number} New ELO rating
   */
  calculateELO: (currentElo, placement, kills, totalTeams = 20) => {
    const K = 32; // K-factor
    const placementBonus = Math.max(0, (totalTeams - placement + 1) / totalTeams);
    const killBonus = kills * 0.05;
    const eloChange = Math.round(K * (placementBonus + killBonus - 0.5));
    return currentElo + eloChange;
  },

  /**
   * Calculate winrate (% of games won)
   * @param {number} wins - Number of wins (1st place)
   * @param {number} gamesPlayed - Total games played
   * @returns {number} Winrate percentage
   */
  calculateWinrate: (wins, gamesPlayed) => {
    return gamesPlayed > 0 ? parseFloat(((wins / gamesPlayed) * 100).toFixed(2)) : 0;
  },

  /**
   * Calculate top 3 rate
   * @param {number} top3 - Number of top 3 finishes
   * @param {number} gamesPlayed - Total games played
   * @returns {number} Top 3 rate percentage
   */
  calculateTop3Rate: (top3, gamesPlayed) => {
    return gamesPlayed > 0 ? parseFloat(((top3 / gamesPlayed) * 100).toFixed(2)) : 0;
  },

  /**
   * Calculate KDA (Battle Royale version)
   * @param {number} kills - Total kills
   * @param {number} deaths - Total deaths
   * @param {number} assists - Total assists
   * @returns {number} KDA ratio
   */
  calculateKDA: (kills, deaths, assists) => {
    return deaths > 0 
      ? parseFloat(((kills + assists) / deaths).toFixed(2)) 
      : parseFloat((kills + assists).toFixed(2));
  },

  /**
   * Calculate average placement
   * @param {Array} placements - Array of placement numbers
   * @returns {number} Average placement
   */
  calculateAvgPlacement: (placements) => {
    if (placements.length === 0) return 0;
    const sum = placements.reduce((acc, p) => acc + p, 0);
    return parseFloat((sum / placements.length).toFixed(2));
  },

  /**
   * Calculate tournament points based on placement and kills
   * @param {number} placement - Match placement
   * @param {number} kills - Number of kills
   * @param {Object} pointsSystem - Points system config
   * @returns {number} Total points
   */
  calculateTournamentPoints: (placement, kills, pointsSystem = {}) => {
    const defaultPlacementPoints = {
      1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
    };
    const placementPoints = pointsSystem.placement || defaultPlacementPoints;
    const killPointValue = pointsSystem.killPoints || 1;

    const placePoints = placementPoints[placement] || 0;
    const killPoints = kills * killPointValue;

    return placePoints + killPoints;
  },

  /**
   * Calculate kills per game
   * @param {number} totalKills - Total kills
   * @param {number} gamesPlayed - Total games played
   * @returns {number} Kills per game
   */
  calculateKillsPerGame: (totalKills, gamesPlayed) => {
    return gamesPlayed > 0 ? parseFloat((totalKills / gamesPlayed).toFixed(2)) : 0;
  },

  /**
   * Update player stats after a match
   * @param {Object} currentStats - Current player stats
   * @param {Object} matchData - Match performance data
   * @returns {Object} Updated stats
   */
  updatePlayerStats: (currentStats, matchData) => {
    const newStats = { ...currentStats };
    
    newStats.gamesPlayed += 1;
    newStats.kills += matchData.kills || 0;
    newStats.deaths += matchData.deaths || 0;
    newStats.assists += matchData.assists || 0;
    newStats.totalDamage += matchData.damage || 0;
    
    if (matchData.placement === 1) newStats.top1 += 1;
    if (matchData.placement <= 3) newStats.top3 += 1;
    if (matchData.placement <= 5) newStats.top5 += 1;
    if (matchData.placement <= 10) newStats.top10 += 1;

    // Recalculate derived stats
    newStats.kda = module.exports.calculateKDA(newStats.kills, newStats.deaths, newStats.assists);
    newStats.winrate = module.exports.calculateWinrate(newStats.top1, newStats.gamesPlayed);
    newStats.avgDamage = Math.round(newStats.totalDamage / newStats.gamesPlayed);
    newStats.killsPerGame = module.exports.calculateKillsPerGame(newStats.kills, newStats.gamesPlayed);

    return newStats;
  },

  /**
   * Update team stats after a match
   * @param {Object} currentStats - Current team stats
   * @param {Object} matchData - Match performance data
   * @returns {Object} Updated stats
   */
  updateTeamStats: (currentStats, matchData) => {
    const newStats = { ...currentStats };
    
    newStats.gamesPlayed += 1;
    newStats.totalKills += matchData.kills || 0;
    
    if (matchData.placement === 1) newStats.top1 += 1;
    if (matchData.placement <= 3) newStats.top3 += 1;
    if (matchData.placement <= 5) newStats.top5 += 1;
    if (matchData.placement <= 10) newStats.top10 += 1;

    newStats.totalPoints += matchData.points || 0;

    // Recalculate derived stats
    newStats.winrate = module.exports.calculateWinrate(newStats.top1, newStats.gamesPlayed);
    newStats.top3Rate = module.exports.calculateTop3Rate(newStats.top3, newStats.gamesPlayed);
    newStats.avgKillsPerGame = module.exports.calculateKillsPerGame(newStats.totalKills, newStats.gamesPlayed);

    return newStats;
  },
};
