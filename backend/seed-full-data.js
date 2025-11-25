const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import real models
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Tournament = require('./src/models/Tournament');
const Scrim = require('./src/models/Scrim');
const Listing = require('./src/models/Listing');
const Announcement = require('./src/models/Announcement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/supervive-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedFullData() {
  try {
    console.log('🧹 Nettoyage COMPLET de la base de données...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Tournament.deleteMany({});
    await Scrim.deleteMany({});
    await Listing.deleteMany({});
    await Announcement.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('\n👤 Création des utilisateurs...');
    
    // Admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@supervise.gg',
      password: hashedPassword,
      role: 'admin',
      profile: {
        bio: 'Platform Administrator',
        country: 'FR',
      },
    });
    console.log('✅ Admin créé: admin / password123');

    // Organizer
    const organizer = await User.create({
      username: 'organizer',
      email: 'organizer@supervise.gg',
      password: hashedPassword,
      role: 'organizer',
      profile: {
        bio: 'Tournament Organizer',
        country: 'FR',
      },
    });
    console.log('✅ Organizer créé: organizer / password123');

    // Create 100 players for realistic data
    const players = [];
    const playerNames = [
      'Shadow', 'Phoenix', 'Thunder', 'Viper', 'Frost', 'Blaze', 'Storm', 'Raven',
      'Wolf', 'Tiger', 'Eagle', 'Falcon', 'Hawk', 'Dragon', 'Serpent', 'Cobra',
      'Saber', 'Blade', 'Ghost', 'Wraith', 'Phantom', 'Spirit', 'Ninja', 'Samurai',
      'Knight', 'Warrior', 'Hunter', 'Ranger', 'Archer', 'Sniper', 'Tank', 'Bruiser',
      'Mage', 'Healer', 'Support', 'Carry', 'Mid', 'Top', 'Jungle', 'ADC',
      'Ace', 'King', 'Queen', 'Jack', 'Joker', 'Duke', 'Baron', 'Lord',
      'Nova', 'Stellar', 'Cosmic', 'Lunar', 'Solar', 'Astro', 'Nebula', 'Orbit',
      'Cyber', 'Digital', 'Virtual', 'Matrix', 'Neon', 'Pixel', 'Byte', 'Code',
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Theta', 'Zeta',
      'Fire', 'Ice', 'Water', 'Earth', 'Wind', 'Light', 'Dark', 'Void',
      'Swift', 'Quick', 'Flash', 'Rush', 'Dash', 'Speed', 'Sonic', 'Turbo',
      'Titan', 'Giant', 'Colossus', 'Goliath', 'Mammoth', 'Behemoth', 'Leviathan', 'Kraken'
    ];

    for (let i = 1; i <= 100; i++) {
      const name = playerNames[i - 1] || `Player${i}`;
      const player = await User.create({
        username: name,
        email: `${name.toLowerCase()}@supervise.gg`,
        password: hashedPassword,
        role: i % 5 === 1 ? 'captain' : 'player',
        profile: {
          bio: `Competitive Supervise player`,
          country: i <= 50 ? 'FR' : i <= 75 ? 'US' : i <= 90 ? 'GB' : 'DE',
        },
      });
      players.push(player);
    }
    console.log(`✅ ${players.length} joueurs créés / password123`);

    console.log('\n🏆 Création des équipes...');
    const teams = [];
    const teamData = [
      { name: 'Phoenix Rising', tag: 'PHX', region: 'EU' },
      { name: 'Shadow Warriors', tag: 'SHW', region: 'EU' },
      { name: 'Thunder Strike', tag: 'THU', region: 'EU' },
      { name: 'Midnight Legends', tag: 'MDL', region: 'EU' },
      { name: 'Apex Predators', tag: 'APX', region: 'EU' },
      { name: 'Viper Squad', tag: 'VPR', region: 'NA' },
      { name: 'Frost Giants', tag: 'FRG', region: 'NA' },
      { name: 'Storm Bringers', tag: 'STB', region: 'NA' },
      { name: 'Raven Knights', tag: 'RVK', region: 'NA' },
      { name: 'Wolf Pack', tag: 'WLP', region: 'NA' },
      { name: 'Eagle Eyes', tag: 'EGL', region: 'EU' },
      { name: 'Dragon Force', tag: 'DRG', region: 'EU' },
      { name: 'Cobra Strike', tag: 'CBS', region: 'EU' },
      { name: 'Ghost Legion', tag: 'GHL', region: 'NA' },
      { name: 'Phantom Elite', tag: 'PHE', region: 'NA' },
      { name: 'Ninja Masters', tag: 'NJM', region: 'EU' },
      { name: 'Samurai Squad', tag: 'SMS', region: 'EU' },
      { name: 'Cyber Titans', tag: 'CYT', region: 'NA' },
      { name: 'Nova Stars', tag: 'NVS', region: 'NA' },
      { name: 'Alpha Team', tag: 'ALP', region: 'EU' },
    ];

    for (let i = 0; i < teamData.length; i++) {
      const captainIndex = i * 5;
      const captain = players[captainIndex];
      
      const teamMembers = [
        captain._id,
        players[captainIndex + 1]._id,
        players[captainIndex + 2]._id,
        players[captainIndex + 3]._id,
        players[captainIndex + 4]._id,
      ];

      const team = await Team.create({
        name: teamData[i].name,
        tag: teamData[i].tag,
        region: teamData[i].region,
        members: teamMembers,
        captain: captain._id,
        logo: `https://ui-avatars.com/api/?name=${teamData[i].tag}&background=random`,
        stats: {
          tournamentsPlayed: Math.floor(Math.random() * 20),
          tournamentsWon: Math.floor(Math.random() * 5),
          totalPoints: Math.floor(Math.random() * 1000),
        },
      });

      // Update players' teamId
      for (const memberId of teamMembers) {
        await User.findByIdAndUpdate(memberId, { teamId: team._id });
      }

      teams.push(team);
      console.log(`✅ ${team.name} [${team.tag}] créée`);
    }

    console.log('\n🎮 Création des tournois...');
    
    // Tournament 1 - Upcoming with check-in
    const tournament1Date = new Date();
    tournament1Date.setDate(tournament1Date.getDate() + 7);
    tournament1Date.setHours(18, 0, 0, 0);

    const tournament1 = await Tournament.create({
      name: 'Supervise Championship - November',
      description: 'Grand tournoi mensuel avec prize pool de $10,000',
      tier: 'Tier 1',
      region: 'EU',
      format: 'points-based',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 16,
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
      startDate: tournament1Date,
      endDate: new Date(tournament1Date.getTime() + 4 * 60 * 60 * 1000),
      status: 'registration',
      rules: `Points System:
• Each kill: 1 point
• Placement points: 20/15/12/10/8/6/4/3/2/1/0/0

Check-in:
• Opens 2 hours before tournament
• Closes 30 minutes before tournament
• Captain only

Tiebreakers:
• Total placement points
• Points before last game`,
      checkInSettings: {
        enabled: true,
        opensAt: new Date(tournament1Date.getTime() - 2 * 60 * 60 * 1000),
        closesAt: new Date(tournament1Date.getTime() - 30 * 60 * 1000),
      },
      organizer: organizer._id,
      registeredTeams: teams.slice(0, 16).map((team, index) => ({
        team: team._id,
        registeredAt: new Date(Date.now() - (16 - index) * 60 * 60 * 1000),
        checkedIn: false,
      })),
      waitlist: teams.slice(16, 20).map((team, index) => ({
        team: team._id,
        joinedAt: new Date(),
        position: index + 1,
      })),
    });
    console.log(`✅ ${tournament1.name} créé (${tournament1.registeredTeams.length} teams, ${tournament1.waitlist.length} waitlist)`);

    // Tournament 2 - Tier 2 Open
    const tournament2Date = new Date();
    tournament2Date.setDate(tournament2Date.getDate() + 14);
    tournament2Date.setHours(20, 0, 0, 0);

    const tournament2 = await Tournament.create({
      name: 'Open Cup - Tier 2',
      description: 'Tournoi ouvert pour équipes Tier 2 avec $2,500 de prize pool',
      tier: 'Tier 2',
      region: 'EU',
      format: 'points-based',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 20,
      numberOfGames: 5,
      prizePool: 2500,
      prizeDistribution: [
        { placement: 1, percentage: 50 },
        { placement: 2, percentage: 30 },
        { placement: 3, percentage: 20 },
      ],
      startDate: tournament2Date,
      endDate: new Date(tournament2Date.getTime() + 3 * 60 * 60 * 1000),
      status: 'registration',
      checkInSettings: {
        enabled: true,
        opensAt: new Date(tournament2Date.getTime() - 2 * 60 * 60 * 1000),
        closesAt: new Date(tournament2Date.getTime() - 30 * 60 * 1000),
      },
      organizer: organizer._id,
      registeredTeams: teams.slice(0, 12).map((team, index) => ({
        team: team._id,
        registeredAt: new Date(Date.now() - (12 - index) * 60 * 60 * 1000),
        checkedIn: false,
      })),
    });
    console.log(`✅ ${tournament2.name} créé (${tournament2.registeredTeams.length} teams)`);

    // Tournament 3 - With qualifiers
    const tournament3Date = new Date();
    tournament3Date.setDate(tournament3Date.getDate() + 21);
    tournament3Date.setHours(19, 0, 0, 0);

    const tournament3 = await Tournament.create({
      name: 'Major Championship - December',
      description: 'Grand tournoi avec qualifications et $25,000 de prize pool',
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
      maxTeams: 20,
      numberOfGames: 6,
      prizePool: 25000,
      prizeDistribution: [
        { placement: 1, percentage: 35 },
        { placement: 2, percentage: 25 },
        { placement: 3, percentage: 15 },
        { placement: 4, percentage: 10 },
        { placement: 5, percentage: 8 },
        { placement: 6, percentage: 7 },
      ],
      startDate: tournament3Date,
      endDate: new Date(tournament3Date.getTime() + 5 * 60 * 60 * 1000),
      status: 'registration',
      hasQualifiers: true,
      qualifierSettings: {
        numberOfGroups: 2,
        teamsPerGroup: 10,
        qualifiersPerGroup: 8,
        gamesPerGroup: 4,
      },
      checkInSettings: {
        enabled: true,
        opensAt: new Date(tournament3Date.getTime() - 2 * 60 * 60 * 1000),
        closesAt: new Date(tournament3Date.getTime() - 30 * 60 * 1000),
      },
      organizer: admin._id,
      registeredTeams: teams.slice(0, 20).map((team, index) => ({
        team: team._id,
        registeredAt: new Date(Date.now() - (20 - index) * 60 * 60 * 1000),
        checkedIn: false,
      })),
    });
    console.log(`✅ ${tournament3.name} créé avec qualifications`);

    console.log('\n⚔️  Création des scrims...');
    
    // Create 15 scrims
    for (let i = 1; i <= 15; i++) {
      const scrimDate = new Date();
      scrimDate.setDate(scrimDate.getDate() + i);
      scrimDate.setHours(15 + (i % 6), 0, 0, 0);

      const hostTeam = teams[i % teams.length];
      const numParticipants = Math.min(6 + Math.floor(i / 2), 12);
      const participantTeams = teams.slice(0, numParticipants).filter(t => t._id.toString() !== hostTeam._id.toString());

      const scrim = await Scrim.create({
        host: hostTeam._id,
        region: i % 2 === 0 ? 'EU' : 'NA',
        tier: i % 3 === 0 ? 'Tier 1' : i % 3 === 1 ? 'Tier 2' : 'Both',
        date: scrimDate,
        maxTeams: 12,
        numberOfGames: Math.floor(Math.random() * 3) + 2,
        status: i > 10 ? 'pending' : i > 5 ? 'confirmed' : 'completed',
        participants: participantTeams.slice(0, numParticipants - 1).map(team => ({
          team: team._id,
          status: Math.random() > 0.2 ? 'confirmed' : Math.random() > 0.5 ? 'invited' : 'declined',
        })),
        notes: `Practice scrim session ${i} - ${scrimDate.toLocaleDateString()}`,
      });
      console.log(`✅ Scrim ${i} créé (${hostTeam.name} host, ${participantTeams.length} participants)`);
    }

    console.log('\n💼 Création des annonces mercato...');
    
    // LFT listings
    for (let i = 0; i < 10; i++) {
      const player = players[i + 50];
      await Listing.create({
        type: 'LFT',
        author: player._id,
        title: `${player.username} - Looking for Team`,
        description: `Experienced player looking for competitive team`,
        roles: ['Fighters', 'Initiators'],
        region: 'EU',
        availability: 'Weekends',
        contact: { discord: `${player.username}#${1000 + i}` },
      });
    }

    // LFP listings
    for (let i = 0; i < 5; i++) {
      const team = teams[i];
      const captain = await User.findById(team.captain);
      await Listing.create({
        type: 'LFP',
        author: captain._id,
        title: `${team.name} - Looking for Players`,
        description: `${team.name} is recruiting skilled players for competitive play`,
        roles: ['Protectors', 'Controllers'],
        region: team.region,
        availability: 'Daily',
        contact: { discord: `${captain.username}#${2000 + i}` },
      });
    }
    console.log(`✅ 15 annonces mercato créées`);

    console.log('\n📢 Création des annonces...');
    await Announcement.create({
      title: 'Welcome to Supervise Competitive Platform!',
      content: 'The official competitive platform for Supervise is now live! Register your team and participate in tournaments.',
      author: admin._id,
      pinned: true,
    });

    await Announcement.create({
      title: 'November Championship Registration Open',
      content: 'Registration is now open for the Supervise Championship with a $10,000 prize pool. Don\'t miss out!',
      author: organizer._id,
      pinned: true,
    });

    await Announcement.create({
      title: 'New Scrim System Available',
      content: 'Teams can now schedule and participate in practice scrims. Improve your skills before the big tournaments!',
      author: admin._id,
    });
    console.log(`✅ 3 annonces créées`);

    console.log('\n✅ Base de données complète créée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - ${await User.countDocuments()} utilisateurs`);
    console.log(`   - ${teams.length} équipes`);
    console.log(`   - ${await Tournament.countDocuments()} tournois`);
    console.log(`   - ${await Scrim.countDocuments()} scrims`);
    console.log(`   - ${await Listing.countDocuments()} annonces mercato`);
    console.log(`   - ${await Announcement.countDocuments()} annonces`);
    console.log('\n🔐 Comptes:');
    console.log('   - admin / password123');
    console.log('   - organizer / password123');
    console.log('   - Tous les joueurs / password123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

seedFullData();
