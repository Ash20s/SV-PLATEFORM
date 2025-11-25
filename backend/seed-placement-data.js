require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./src/models/Team');

/**
 * Script pour générer des données de placement de test
 * Simule des matchs avec placements réalistes basés sur le tier
 */

async function seedPlacementData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    const teams = await Team.find({});
    console.log(`📊 ${teams.length} équipes trouvées\n`);

    let updated = 0;

    for (const team of teams) {
      // Déterminer le nombre de matchs selon le tier actuel
      let numMatches;
      let avgPlacement;
      
      if (team.tier === 'Tier 1') {
        numMatches = Math.floor(Math.random() * 20) + 40; // 40-60 matchs
        avgPlacement = 2 + Math.random() * 2; // Avg entre 2-4
      } else if (team.tier === 'Tier 2') {
        numMatches = Math.floor(Math.random() * 15) + 25; // 25-40 matchs
        avgPlacement = 4 + Math.random() * 3; // Avg entre 4-7
      } else {
        numMatches = Math.floor(Math.random() * 10) + 10; // 10-20 matchs
        avgPlacement = 5 + Math.random() * 4; // Avg entre 5-9
      }

      // Générer des placements réalistes
      const placements = [];
      for (let i = 0; i < numMatches; i++) {
        // Distribution gaussienne autour de avgPlacement
        let placement = Math.round(avgPlacement + (Math.random() - 0.5) * 4);
        placement = Math.max(1, Math.min(10, placement)); // Entre 1 et 10
        placements.push(placement);
      }

      // Calculer le MMR basé sur les placements
      let currentMMR = team.mmr?.value || 1200;
      const history = [];
      const recentForm = [];

      placements.forEach((placement, index) => {
        // Calculer le changement de MMR basé sur le placement
        const expectedPlacement = 5.5; // Milieu d'un lobby de 10
        const performanceScore = (10 - placement) / 9; // 1.0 = 1st, 0.0 = 10th
        const expectedScore = (10 - expectedPlacement) / 9;
        
        const K = 20; // K-factor
        const mmrChange = Math.round(K * (performanceScore - expectedScore));
        
        currentMMR += mmrChange;
        currentMMR = Math.max(1000, Math.min(2600, currentMMR)); // Limites

        // Ajouter à l'historique
        history.push({
          mmr: currentMMR,
          change: mmrChange,
          placement: placement,
          totalTeams: 10,
          date: new Date(Date.now() - (numMatches - index) * 24 * 60 * 60 * 1000), // 1 jour entre chaque
        });

        // Form récente (10 derniers matchs)
        if (index >= numMatches - 10) {
          if (placement <= 3) {
            recentForm.push('W'); // Top 3 = Win
          } else if (placement >= 8) {
            recentForm.push('L'); // Bottom 3 = Loss
          } else {
            recentForm.push('D'); // Middle = Draw
          }
        }
      });

      // Calculer les stats
      const avgPlacementFinal = placements.reduce((a, b) => a + b, 0) / placements.length;
      const bestPlacement = Math.min(...placements);
      const tier = calculateTier(currentMMR);

      // Mettre à jour l'équipe
      await Team.findByIdAndUpdate(team._id, {
        $set: {
          'mmr.value': currentMMR,
          'mmr.tier': tier,
          'mmr.peak': Math.max(currentMMR, team.mmr?.peak || 0),
          'mmr.history': history,
          'mmr.recentForm': recentForm,
          'mmr.gamesPlayed': numMatches,
          'mmr.isCalibrating': false,
          'mmr.lastUpdated': new Date(),
          'stats.wins': placements.filter(p => p === 1).length,
          'stats.losses': placements.filter(p => p >= 8).length,
        }
      });

      console.log(`✅ ${team.name}`);
      console.log(`   - Matchs: ${numMatches}`);
      console.log(`   - Avg Placement: ${avgPlacementFinal.toFixed(1)}`);
      console.log(`   - Best: ${bestPlacement}${bestPlacement === 1 ? '🥇' : bestPlacement === 2 ? '🥈' : bestPlacement === 3 ? '🥉' : ''}`);
      console.log(`   - MMR: ${team.mmr?.value || 1200} → ${currentMMR} (${tier})`);
      console.log(`   - Form: ${recentForm.slice(-5).join('')}\n`);

      updated++;
    }

    console.log(`\n🎉 ${updated} équipes mises à jour avec des données de placement !`);
    console.log(`\n💡 Rafraîchissez le leaderboard pour voir les résultats !`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

/**
 * Helper: Calculate tier based on MMR
 */
function calculateTier(mmr) {
  if (mmr >= 2200) return 'ELITE';
  if (mmr >= 1900) return 'T1';
  if (mmr >= 1600) return 'T2H';
  if (mmr >= 1300) return 'T2';
  return 'T3';
}

seedPlacementData();

