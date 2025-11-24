/**
 * Script de test rapide pour le système Mock
 * Usage: node test-mock-api.js
 */

const superviveAPIMock = require('./src/services/superviveAPIMock');
const superviveAPI = require('./src/services/superviveAPI');

async function testMockAPI() {
  console.log('🧪 Test du système Mock Supervive API\n');

  // 1. Vérifier les stats
  console.log('1️⃣ Statistiques du mock:');
  const stats = superviveAPIMock.getStats();
  console.log(JSON.stringify(stats, null, 2));
  console.log('');

  // 2. Lister les matches
  console.log('2️⃣ Liste des matches disponibles:');
  const matches = await superviveAPIMock.getMatches(null, 5);
  console.log(`Trouvé ${matches.length} matches`);
  matches.forEach((match, idx) => {
    console.log(`  ${idx + 1}. ${match.MatchID}`);
    console.log(`     Teams: ${match.MatchDetails.NumTeams}, Players: ${match.MatchDetails.NumParticipants}`);
    console.log(`     Date: ${match.MatchDetails.MatchStart}`);
  });
  console.log('');

  // 3. Récupérer les détails d'un match
  if (matches.length > 0) {
    console.log('3️⃣ Détails du premier match:');
    const matchDetails = await superviveAPIMock.getMatchDetails(matches[0].MatchID);
    console.log(`Match ID: ${matchDetails.MatchID}`);
    console.log(`Teams: ${matchDetails.MatchDetails.NumTeams}`);
    console.log(`Participants: ${matchDetails.MatchDetails.NumParticipants}`);
    
    // Trouver le gagnant
    const winner = matchDetails.TeamMatchDetails.find(t => t.Placement === 1);
    if (winner) {
      const winnerPlayers = Object.values(matchDetails.PlayerMatchDetails)
        .filter(p => p.TeamID === winner.TeamID);
      console.log(`\n🏆 Équipe gagnante: ${winner.TeamID}`);
      console.log(`Joueurs:`);
      winnerPlayers.forEach(p => {
        const stats = p.PlayerMatchStats;
        console.log(`  - ${p.DisplayName} (${p.Tag})`);
        console.log(`    Kills: ${stats.Kills}, Damage: ${stats.DamageDone.toLocaleString()}, Placement: #${p.Placement}`);
      });
    }
    console.log('');

    // 4. Normaliser le match
    console.log('4️⃣ Match normalisé:');
    const normalized = superviveAPI.normalizeMatch(matchDetails);
    console.log(`Match ID: ${normalized.matchId}`);
    console.log(`Date: ${normalized.matchStart} - ${normalized.matchEnd}`);
    console.log(`Joueurs: ${normalized.playerStats.length}`);
    console.log(`Équipes: ${normalized.teamPlacements.length}`);
    
    // Trouver le meilleur joueur (plus de damage)
    const topPlayer = normalized.playerStats
      .sort((a, b) => b.stats.damageDone - a.stats.damageDone)[0];
    if (topPlayer) {
      console.log(`\n⭐ Meilleur joueur (damage):`);
      console.log(`  ${topPlayer.displayName} (${topPlayer.tag})`);
      console.log(`  Damage: ${topPlayer.stats.damageDone.toLocaleString()}`);
      console.log(`  Kills: ${topPlayer.stats.kills}`);
      console.log(`  Placement: #${topPlayer.placement}`);
    }
    console.log('');

    // 5. Calculer un profil joueur
    if (normalized.playerStats.length > 0) {
      console.log('5️⃣ Profil calculé pour un joueur:');
      const playerId = normalized.playerStats[0].supervivePlayerId;
      const profile = superviveAPI.calculatePlayerProfile([normalized], playerId);
      if (profile) {
        console.log(JSON.stringify(profile, null, 2));
      }
      console.log('');
    }
  }

  // 6. Ajouter un nouveau match
  console.log('6️⃣ Ajout d\'un nouveau match mock:');
  const newMatch = superviveAPIMock.addMockMatch();
  console.log(`✅ Match créé: ${newMatch.MatchID}`);
  console.log(`   Teams: ${newMatch.MatchDetails.NumTeams}`);
  console.log(`   Date: ${newMatch.MatchDetails.MatchStart}`);
  console.log('');

  // 7. Stats finales
  console.log('7️⃣ Stats finales:');
  const finalStats = superviveAPIMock.getStats();
  console.log(JSON.stringify(finalStats, null, 2));

  console.log('\n✅ Tests terminés avec succès!');
  console.log('\n💡 Pour tester avec l\'API REST:');
  console.log('   - GET  http://localhost:5000/api/mock/stats');
  console.log('   - GET  http://localhost:5000/api/mock/matches');
  console.log('   - POST http://localhost:5000/api/mock/match (avec auth)');
  console.log('   - POST http://localhost:5000/api/mock/sync-all (avec auth)');
}

// Exécuter les tests
testMockAPI().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});

