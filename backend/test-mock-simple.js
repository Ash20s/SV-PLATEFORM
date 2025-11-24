/**
 * Script de test simplifié pour le système Mock
 * N'utilise que le mock directement, sans dépendances
 */

const superviveAPIMock = require('./src/services/superviveAPIMock');

async function testMockAPI() {
  console.log('🧪 Test du système Mock Supervive API\n');
  console.log('='.repeat(50));

  // 1. Vérifier les stats
  console.log('\n1️⃣ Statistiques du mock:');
  console.log('-'.repeat(50));
  const stats = superviveAPIMock.getStats();
  console.log(JSON.stringify(stats, null, 2));

  // 2. Lister les matches
  console.log('\n2️⃣ Liste des matches disponibles:');
  console.log('-'.repeat(50));
  const matches = await superviveAPIMock.getMatches(null, 5);
  console.log(`✅ Trouvé ${matches.length} matches\n`);
  
  matches.forEach((match, idx) => {
    console.log(`  Match ${idx + 1}:`);
    console.log(`    ID: ${match.MatchID}`);
    console.log(`    Teams: ${match.MatchDetails.NumTeams}`);
    console.log(`    Players: ${match.MatchDetails.NumParticipants}`);
    console.log(`    Date: ${new Date(match.MatchDetails.MatchStart).toLocaleString()}`);
    console.log(`    Region: ${match.MatchDetails.ConnectionDetails?.Region || 'N/A'}`);
    console.log('');
  });

  // 3. Récupérer les détails d'un match
  if (matches.length > 0) {
    console.log('3️⃣ Détails du premier match:');
    console.log('-'.repeat(50));
    const matchDetails = await superviveAPIMock.getMatchDetails(matches[0].MatchID);
    console.log(`Match ID: ${matchDetails.MatchID}`);
    console.log(`Teams: ${matchDetails.MatchDetails.NumTeams}`);
    console.log(`Participants: ${matchDetails.MatchDetails.NumParticipants}`);
    console.log(`Max Team Size: ${matchDetails.MatchDetails.MaxTeamSize}`);
    console.log(`Region: ${matchDetails.MatchDetails.ConnectionDetails?.Region}`);
    console.log(`Start: ${matchDetails.MatchDetails.MatchStart}`);
    console.log(`End: ${matchDetails.MatchDetails.MatchEnd}`);
    
    // Trouver le gagnant
    const winner = matchDetails.TeamMatchDetails.find(t => t.Placement === 1);
    if (winner) {
      const winnerPlayers = Object.values(matchDetails.PlayerMatchDetails)
        .filter(p => p.TeamID === winner.TeamID);
      console.log(`\n🏆 Équipe gagnante: ${winner.TeamID}`);
      console.log(`   Placement: #${winner.Placement}`);
      console.log(`   Joueurs (${winnerPlayers.length}):`);
      winnerPlayers.forEach((p, idx) => {
        const stats = p.PlayerMatchStats;
        console.log(`     ${idx + 1}. ${p.DisplayName} [${p.Tag}]`);
        console.log(`        Hero: ${p.HeroAssetID}`);
        console.log(`        Kills: ${stats.Kills}`);
        console.log(`        Damage: ${stats.DamageDone.toLocaleString()}`);
        console.log(`        Assists: ${stats.Assists}`);
        console.log(`        Deaths: ${stats.Deaths}`);
        console.log(`        Placement: #${p.Placement}`);
      });
    }

    // Top 3 joueurs par damage
    console.log('\n⭐ Top 3 joueurs par damage:');
    console.log('-'.repeat(50));
    const topPlayers = Object.values(matchDetails.PlayerMatchDetails)
      .sort((a, b) => b.PlayerMatchStats.DamageDone - a.PlayerMatchStats.DamageDone)
      .slice(0, 3);
    
    topPlayers.forEach((p, idx) => {
      const stats = p.PlayerMatchStats;
      console.log(`  ${idx + 1}. ${p.DisplayName} [${p.Tag}]`);
      console.log(`     Damage: ${stats.DamageDone.toLocaleString()}`);
      console.log(`     Kills: ${stats.Kills}`);
      console.log(`     Placement: #${p.Placement}`);
      console.log(`     Team: ${p.TeamID}`);
      console.log('');
    });
  }

  // 4. Ajouter un nouveau match
  console.log('4️⃣ Ajout d\'un nouveau match mock:');
  console.log('-'.repeat(50));
  const newMatch = superviveAPIMock.addMockMatch();
  console.log(`✅ Match créé: ${newMatch.MatchID}`);
  console.log(`   Teams: ${newMatch.MatchDetails.NumTeams}`);
  console.log(`   Players: ${newMatch.MatchDetails.NumParticipants}`);
  console.log(`   Date: ${new Date(newMatch.MatchDetails.MatchStart).toLocaleString()}`);

  // 5. Stats finales
  console.log('\n5️⃣ Stats finales:');
  console.log('-'.repeat(50));
  const finalStats = superviveAPIMock.getStats();
  console.log(JSON.stringify(finalStats, null, 2));

  // 6. Test de filtrage par date
  console.log('\n6️⃣ Test de filtrage par date:');
  console.log('-'.repeat(50));
  const oneHourAgo = new Date(Date.now() - 3600000);
  const recentMatches = await superviveAPIMock.getMatches(oneHourAgo, 10);
  console.log(`Matches des dernières heures: ${recentMatches.length}`);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests terminés avec succès!');
  console.log('\n💡 Pour tester avec l\'API REST:');
  console.log('   1. Démarrer le serveur: npm run dev');
  console.log('   2. GET  http://localhost:5000/api/mock/stats');
  console.log('   3. GET  http://localhost:5000/api/mock/matches');
  console.log('   4. POST http://localhost:5000/api/mock/match (avec auth)');
  console.log('   5. POST http://localhost:5000/api/mock/sync-all (avec auth)');
}

// Exécuter les tests
testMockAPI().catch(error => {
  console.error('\n❌ Erreur lors des tests:', error.message);
  console.error(error.stack);
  process.exit(1);
});

