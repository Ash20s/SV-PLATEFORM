const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import real models
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Tournament = require('./src/models/Tournament');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/supervise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedData() {
  try {
    // Vérifier si des données existent déjà
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️  La base de données contient déjà des données !');
      console.log(`   - ${userCount} utilisateurs trouvés`);
      console.log('   Pour éviter d\'effacer vos données, le script s\'arrête.');
      console.log('   Si vous voulez vraiment réinitialiser, supprimez manuellement les données d\'abord.');
      return;
    }

    console.log('🧹 Nettoyage de la base de données...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Tournament.deleteMany({});

    console.log('\n👤 Création des utilisateurs...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin/Organizer
    const admin = await User.create({
      username: 'admin',
      email: 'admin@supervise.gg',
      password: hashedPassword,
      role: 'admin',
      profile: {
        bio: 'Tournament organizer',
        country: 'FR',
      },
    });
    console.log('✅ Admin créé: admin / password123');

    // Créer 20 joueurs pour 5 équipes
    const players = [];
    for (let i = 1; i <= 20; i++) {
      const player = await User.create({
        username: `player${i}`,
        email: `player${i}@supervise.gg`,
        password: hashedPassword,
        role: i % 4 === 1 ? 'captain' : 'player',
        profile: {
          bio: `Competitive player #${i}`,
          country: i <= 10 ? 'FR' : 'US',
        },
      });
      players.push(player);
    }
    console.log(`✅ ${players.length} joueurs créés (player1-player20 / password123)`);

    console.log('\n🏆 Création des équipes...');
    const teams = [];
    const teamNames = [
      { name: 'Phoenix Rising', tag: 'PHX', region: 'EU' },
      { name: 'Shadow Warriors', tag: 'SHW', region: 'EU' },
      { name: 'Thunder Strike', tag: 'THU', region: 'NA' },
      { name: 'Midnight Legends', tag: 'MDL', region: 'EU' },
      { name: 'Apex Predators', tag: 'APX', region: 'NA' },
    ];

    for (let i = 0; i < 5; i++) {
      const teamPlayers = players.slice(i * 4, (i + 1) * 4);
      const captain = teamPlayers[0];

      const team = await Team.create({
        name: teamNames[i].name,
        tag: teamNames[i].tag,
        region: teamNames[i].region,
        members: teamPlayers.map(p => p._id),
        captain: captain._id,
        stats: {
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          totalPoints: 0,
        },
      });

      // Mettre à jour les joueurs avec leur teamId
      for (const player of teamPlayers) {
        player.teamId = team._id;
        await player.save();
      }

      teams.push(team);
      console.log(`✅ ${team.name} [${team.tag}] créée (Capitaine: ${captain.username})`);
    }

    console.log('\n🎮 Création du tournoi de test...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Dans 7 jours
    startDate.setHours(18, 0, 0, 0);

    const tournament = await Tournament.create({
      name: 'Supervise Championship - Test Event',
      description: 'Tournoi de test avec système de points officiel Supervise, check-in et prize pool',
      tier: 'Both',
      region: 'EU',
      format: 'points-based',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 4, // Volontairement limité pour tester la waitlist
      numberOfGames: 6,
      prizePool: 10000,
      prizeDistribution: [
        { placement: 1, percentage: 40 },
        { placement: 2, percentage: 25 },
        { placement: 3, percentage: 15 },
        { placement: 4, percentage: 10 },
        { placement: 5, percentage: 6 },
        { placement: 6, percentage: 4 },
      ],
      startDate: startDate,
      endDate: new Date(startDate.getTime() + 3 * 60 * 60 * 1000), // 3h plus tard
      status: 'registration',
      rules: `Points System:
• Each kill: 1 point
• 1st place: 20 points
• 2nd place: 15 points
• 3rd place: 12 points
• 4th place: 10 points
• 5th place: 8 points
• 6th place: 6 points
• 7th place: 4 points
• 8th place: 3 points
• 9th place: 2 points
• 10th place: 1 point
• 11th/12th place: 0 points

Tiebreakers:
• The team with more total placement points
• If still tied, the team with more points before the last game

Check-in:
• Check-in opens 2 hours before the tournament
• Check-in closes 30 minutes before the tournament
• Only team captains can check-in
• Teams that don't check-in will be disqualified

Substitutes:
• If missing a team member, you must find a substitute
• If you can't find a sub after 15 minutes of the tournament start, your team will be disqualified`,
      checkInSettings: {
        enabled: true,
        opensAt: new Date(startDate.getTime() - 2 * 60 * 60 * 1000), // 2h avant
        closesAt: new Date(startDate.getTime() - 30 * 60 * 1000), // 30min avant
      },
      organizer: admin._id,
      registeredTeams: [],
      waitlist: [],
    });

    // Inscrire 3 équipes (laissant 1 place libre)
    for (let i = 0; i < 3; i++) {
      tournament.registeredTeams.push({
        team: teams[i]._id,
        registeredAt: new Date(),
        checkedIn: false,
      });
    }

    // Ajouter 2 équipes en waitlist
    for (let i = 3; i < 5; i++) {
      tournament.waitlist.push({
        team: teams[i]._id,
        joinedAt: new Date(),
        position: i - 2,
      });
    }

    await tournament.save();

    console.log('✅ Tournoi créé:');
    console.log(`   - Nom: ${tournament.name}`);
    console.log(`   - Date: ${tournament.startDate.toLocaleString()}`);
    console.log(`   - Prize Pool: $${tournament.prizePool.toLocaleString()}`);
    console.log(`   - Équipes inscrites: ${tournament.registeredTeams.length}/${tournament.maxTeams}`);
    console.log(`   - Équipes en waitlist: ${tournament.waitlist.length}`);
    console.log(`   - Check-in ouvre: ${tournament.checkInSettings.opensAt.toLocaleString()}`);
    console.log(`   - Check-in ferme: ${tournament.checkInSettings.closesAt.toLocaleString()}`);

    console.log('\n✅ Données de test créées avec succès!');
    console.log('\n📝 Pour tester:');
    console.log('1. Connectez-vous avec: admin / password123');
    console.log('2. Ou avec un capitaine: player1 / password123, player5 / password123, etc.');
    console.log('3. Allez sur la page Tournaments pour voir le tournoi');
    console.log('4. Cliquez dessus pour voir les détails avec check-in status');
    console.log('\n🔐 Tous les mots de passe: password123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

seedData();
