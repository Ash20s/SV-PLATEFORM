/**
 * Calculate earnings for a team based on tournament placement
 * @param {Object} tournament - Tournament object with prizePool and prizeDistribution
 * @param {Number} placement - Team's final placement (1, 2, 3, etc.)
 * @returns {Number} - Earnings amount
 */
function calculateEarnings(tournament, placement) {
  if (!tournament.prizePool || tournament.prizePool <= 0) {
    return 0;
  }

  if (!tournament.prizeDistribution || tournament.prizeDistribution.length === 0) {
    return 0;
  }

  // Find the prize distribution for this placement
  const prizeInfo = tournament.prizeDistribution.find(
    p => p.placement === placement
  );

  if (!prizeInfo) {
    return 0;
  }

  // Calculate earnings (percentage of prize pool)
  const earnings = (tournament.prizePool * prizeInfo.percentage) / 100;
  return Math.round(earnings * 100) / 100; // Round to 2 decimals
}

/**
 * Update tournament standings with earnings
 * @param {Object} tournament - Tournament object
 * @returns {Object} - Tournament with updated standings
 */
function updateStandingsWithEarnings(tournament) {
  if (!tournament.standings || tournament.standings.length === 0) {
    return tournament;
  }

  // Sort standings by totalPoints to determine placement
  const sortedStandings = [...tournament.standings].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  // Assign placement and calculate earnings
  sortedStandings.forEach((standing, index) => {
    standing.placement = index + 1;
    standing.earnings = calculateEarnings(tournament, standing.placement);
  });

  return {
    ...tournament,
    standings: sortedStandings
  };
}

/**
 * Calculate tournament points based on placement and kills
 * @param {Number} placement - Match placement (1, 2, 3, etc.)
 * @param {Number} kills - Number of kills
 * @param {Object} pointsSystem - Points system configuration
 * @returns {Number} - Total points
 */
function calculatePoints(placement, kills, pointsSystem = {}) {
  const defaultPlacementPoints = {
    1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
  };
  const placementPoints = pointsSystem.placement || defaultPlacementPoints;
  const killPointValue = pointsSystem.killPoints || 1;

  const placePoints = placementPoints[placement] || 0;
  const killPoints = kills * killPointValue;

  return placePoints + killPoints;
}

module.exports = {
  calculateEarnings,
  updateStandingsWithEarnings,
  calculatePoints
};
