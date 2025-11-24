// Seed script for Battle Royale platform
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Player = require('./src/models/Player');
const PlayerStats = require('./src/models/PlayerStats');
const TeamStats = require('./src/models/TeamStats');
const Tournament = require('./src/models/Tournament');
const Scrim = require('./src/models/Scrim');
const Listing = require('./src/models/Listing');
const Announcement = require('./src/models/Announcement');
const Hero = require('./src/models/Hero');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Player.deleteMany({});
  await PlayerStats.deleteMany({});
  await TeamStats.deleteMany({});
  await Tournament.deleteMany({});
  await Scrim.deleteMany({});
  await Listing.deleteMany({});
  await Announcement.deleteMany({});
  await Hero.deleteMany({});
  console.log('🗑️  Database cleared');
};

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { username: 'admin', email: 'admin@supervive.gg', password: hashedPassword, role: 'admin' },
    { username: 'organizer', email: 'organizer@supervive.gg', password: hashedPassword, role: 'organizer' },
    { username: 'organizer2', email: 'organizer2@supervive.gg', password: hashedPassword, role: 'organizer' },
    { username: 'ProPlayer1', email: 'player1@supervive.gg', password: hashedPassword, role: 'captain' },
    { username: 'ProPlayer2', email: 'player2@supervive.gg', password: hashedPassword, role: 'captain' },
    { username: 'Rookie1', email: 'rookie1@supervive.gg', password: hashedPassword, role: 'player' },
    { username: 'Rookie2', email: 'rookie2@supervive.gg', password: hashedPassword, role: 'player' },
    { username: 'FreeAgent', email: 'freeagent@supervive.gg', password: hashedPassword, role: 'player' },
    { username: 'Viewer1', email: 'viewer1@supervive.gg', password: hashedPassword, role: 'viewer' },
  ];

  // Create more players for teams
  const playerNames = [
    'Shadow', 'Phoenix', 'Thunder', 'Viper', 'Frost', 'Blaze', 'Storm', 'Raven',
    'Wolf', 'Tiger', 'Eagle', 'Falcon', 'Hawk', 'Dragon', 'Serpent', 'Cobra',
    'Saber', 'Blade', 'Ghost', 'Wraith', 'Phantom', 'Spirit', 'Ninja', 'Samurai',
    'Knight', 'Warrior', 'Hunter', 'Ranger', 'Archer', 'Sniper', 'Tank', 'Bruiser',
    'Ace', 'King', 'Queen', 'Jack', 'Joker', 'Duke', 'Baron', 'Lord',
    'Nova', 'Stellar', 'Cosmic', 'Lunar', 'Solar', 'Astro', 'Nebula', 'Orbit',
  ];

  for (let i = 0; i < playerNames.length; i++) {
    users.push({
      username: playerNames[i],
      email: `${playerNames[i].toLowerCase()}@supervive.gg`,
      password: hashedPassword,
      role: 'player',
      profile: {
        bio: `Competitive Supervive player - ${playerNames[i]}`,
        country: i % 3 === 0 ? 'FR' : i % 3 === 1 ? 'US' : 'GB',
      },
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} users seeded`);
  return createdUsers;
};

const seedHeroes = async () => {
  const heroes = [
    { name: 'shadow', displayName: 'Shadow', role: 'DPS', tier: 'S', pickRate: 25.5, winRate: 52.3 },
    { name: 'titan', displayName: 'Titan', role: 'Tank', tier: 'A', pickRate: 18.2, winRate: 50.1 },
    { name: 'healer', displayName: 'Healer', role: 'Support', tier: 'S', pickRate: 22.8, winRate: 53.7 },
    { name: 'sniper', displayName: 'Sniper', role: 'DPS', tier: 'A', pickRate: 15.3, winRate: 48.9 },
    { name: 'scout', displayName: 'Scout', role: 'Utility', tier: 'B', pickRate: 12.1, winRate: 49.2 },
  ];

  await Hero.insertMany(heroes);
  console.log('✅ Heroes seeded');
};

const seedTeams = async (users) => {
  // Team configurations with roster assignments
  const teamConfigs = [
    {
      name: 'Team Apex',
      tag: 'APEX',
      region: 'EU',
      captainIndex: 3, // ProPlayer1
      playerIndices: [9, 10, 11], // Shadow, Phoenix, Thunder
      stats: { wins: 45, losses: 15, elo: 1850, winrate: 75 },
    },
    {
      name: 'Vortex Gaming',
      tag: 'VTX',
      region: 'NA',
      captainIndex: 4, // ProPlayer2
      playerIndices: [12, 13, 14], // Viper, Frost, Blaze
      stats: { wins: 38, losses: 22, elo: 1720, winrate: 63.3 },
    },
    {
      name: 'Phoenix Squad',
      tag: 'PHX',
      region: 'EU',
      captainIndex: 5, // Rookie1
      playerIndices: [15, 16, 17], // Storm, Raven, Wolf
      stats: { wins: 25, losses: 25, elo: 1550, winrate: 50 },
    },
    {
      name: 'Thunder Strike',
      tag: 'THD',
      region: 'NA',
      captainIndex: 6, // Rookie2
      playerIndices: [18, 19, 20], // Tiger, Eagle, Falcon
      stats: { wins: 30, losses: 20, elo: 1650, winrate: 60 },
    },
    {
      name: 'Shadow Legion',
      tag: 'SHD',
      region: 'EU',
      captainIndex: 7, // FreeAgent
      playerIndices: [21, 22, 23], // Hawk, Dragon, Serpent
      stats: { wins: 20, losses: 30, elo: 1450, winrate: 40 },
    },
    {
      name: 'Dragon Force',
      tag: 'DRG',
      region: 'ASIA',
      captainIndex: 9, // Shadow
      playerIndices: [24, 25, 26, 27], // Cobra, Saber, Blade, Ghost
      stats: { wins: 35, losses: 15, elo: 1750, winrate: 70 },
    },
    {
      name: 'Frost Wolves',
      tag: 'FRW',
      region: 'EU',
      captainIndex: 10, // Phoenix
      playerIndices: [28, 29, 30], // Wraith, Phantom, Spirit
      stats: { wins: 28, losses: 22, elo: 1600, winrate: 56 },
    },
    {
      name: 'Storm Riders',
      tag: 'STR',
      region: 'NA',
      captainIndex: 11, // Thunder
      playerIndices: [31, 32, 33], // Ninja, Samurai, Knight
      stats: { wins: 22, losses: 28, elo: 1500, winrate: 44 },
    },
  ];

  const createdTeams = [];

  for (const config of teamConfigs) {
    const captain = users[config.captainIndex];
    const rosterPlayers = config.playerIndices.map(idx => users[idx]);

    // Create roster entries
    const roster = rosterPlayers.map((player, index) => ({
      player: player._id,
      role: index === 0 ? 'DPS' : index === 1 ? 'Tank' : index === 2 ? 'Support' : 'Flex',
      joinedAt: new Date(Date.now() - (rosterPlayers.length - index) * 24 * 60 * 60 * 1000),
    }));

    // Check if captain is in roster, if not add them
    const captainInRoster = roster.some(entry => entry.player.toString() === captain._id.toString());
    if (!captainInRoster) {
      roster.unshift({
        player: captain._id,
        role: 'Captain',
        joinedAt: new Date(Date.now() - (rosterPlayers.length + 1) * 24 * 60 * 60 * 1000),
      });
    }

    const team = await Team.create({
      name: config.name,
      tag: config.tag,
      region: config.region,
      captain: captain._id,
      roster: roster,
      stats: config.stats,
    });

    // Update users with team references and roles
    await User.findByIdAndUpdate(captain._id, { 
      teamId: team._id, 
      role: 'captain' 
    });

    for (const player of rosterPlayers) {
      await User.findByIdAndUpdate(player._id, { 
        teamId: team._id,
        role: 'player'
      });
    }

    createdTeams.push(team);
    console.log(`✅ ${team.name} [${team.tag}] créée avec ${roster.length} membres (Capitaine: ${captain.username})`);
  }

  console.log(`✅ ${createdTeams.length} teams seeded`);
  return createdTeams;
};

const seedPlayers = async (users, teams) => {
  const players = [];
  
  // Create Player records for all users who are players/captains
  for (const user of users) {
    if (user.role === 'player' || user.role === 'captain') {
      // Find team for this user
      const team = teams.find(t => 
        t.captain.toString() === user._id.toString() || 
        t.roster.some(r => r.player.toString() === user._id.toString())
      );

      players.push({
        user: user._id,
        nickname: user.username,
        mainRole: user.username.includes('Shadow') || user.username.includes('Phoenix') || user.username.includes('Thunder') || user.username.includes('Viper') ? 'DPS' :
                 user.username.includes('Tank') || user.username.includes('Bruiser') || user.username.includes('Titan') ? 'Tank' :
                 user.username.includes('Support') || user.username.includes('Healer') || user.username.includes('Mage') ? 'Support' :
                 user.username.includes('Frost') || user.username.includes('Falcon') || user.username.includes('Eagle') ? 'Support' :
                 'Flex',
        team: team ? team._id : null,
      });
    }
  }

  const createdPlayers = await Player.insertMany(players);
  console.log(`✅ ${createdPlayers.length} players seeded`);
  return createdPlayers;
};

const seedPlayerStats = async (players) => {
  const stats = [
    {
      player: players[0]._id,
      gamesPlayed: 120,
      kills: 456,
      deaths: 98,
      assists: 234,
      totalDamage: 145000,
      avgDamage: 1208,
      top1: 25,
      top3: 58,
      top5: 82,
      top10: 95,
      kda: 7.04,
      killsPerGame: 3.8,
      winrate: 20.83,
      avgPlacement: 4.5,
      mostPlayedHero: 'Shadow',
      heroStats: [
        { heroName: 'Shadow', gamesPlayed: 50, kills: 200, wins: 12, avgPlacement: 3.8 },
        { heroName: 'Sniper', gamesPlayed: 40, kills: 180, wins: 8, avgPlacement: 5.2 },
      ],
    },
    {
      player: players[1]._id,
      gamesPlayed: 100,
      kills: 320,
      deaths: 85,
      assists: 450,
      totalDamage: 98000,
      avgDamage: 980,
      top1: 18,
      top3: 42,
      top5: 65,
      top10: 78,
      kda: 9.06,
      killsPerGame: 3.2,
      winrate: 18,
      avgPlacement: 5.8,
      mostPlayedHero: 'Titan',
    },
  ];

  await PlayerStats.insertMany(stats);
  console.log('✅ Player stats seeded');
};

const seedTeamStats = async (teams) => {
  const stats = [
    {
      team: teams[0]._id,
      gamesPlayed: 60,
      totalKills: 450,
      avgKillsPerGame: 7.5,
      top1: 15,
      top3: 32,
      top5: 45,
      top10: 52,
      avgPlacement: 4.2,
      totalPoints: 850,
      elo: 1850,
      winrate: 25,
      top3Rate: 53.3,
    },
    {
      team: teams[1]._id,
      gamesPlayed: 55,
      totalKills: 380,
      avgKillsPerGame: 6.9,
      top1: 12,
      top3: 28,
      top5: 38,
      top10: 48,
      avgPlacement: 5.5,
      totalPoints: 720,
      elo: 1720,
      winrate: 21.8,
      top3Rate: 50.9,
    },
  ];

  await TeamStats.insertMany(stats);
  console.log('✅ Team stats seeded');
};

const seedTournaments = async (users, teams) => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const tournaments = [
    // 1. Tournoi en registration - Squad mode, sans qualifiers
    {
      name: 'Supervive Championship 2025',
      description: 'The biggest Battle Royale tournament of the year',
      format: 'points-based',
      gameMode: 'Squad',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 10,
      numberOfGames: 6,
      prizePool: 50000,
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'registration',
      tier: 'Tier 1',
      region: 'EU',
      organizer: users[1]._id, // organizer
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
      ],
      hasQualifiers: false,
    },
    
    // 2. Tournoi locked - Trio mode, avec qualifiers mais groupes pas encore générés
    {
      name: 'Trio Masters Cup',
      description: 'Competitive Trio tournament with qualification rounds',
      format: 'points-based',
      gameMode: 'Trio',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 12,
      numberOfGames: 5,
      prizePool: 25000,
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      status: 'locked',
      tier: 'Tier 2',
      region: 'NA',
      organizer: users[1]._id, // organizer
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
      ],
      hasQualifiers: true,
      qualifierSettings: {
        numberOfGroups: 2,
        qualifiersPerGroup: 6,
        gamesPerGroup: 3,
        transferNonQualified: false,
      },
    },
    
    // 3. Tournoi locked - Squad mode, avec qualifiers et groupes générés
    {
      name: 'EU Regional Qualifier',
      description: 'Regional qualifier for the main championship',
      format: 'points-based',
      gameMode: 'Squad',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 10,
      numberOfGames: 4,
      prizePool: 15000,
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      status: 'locked',
      tier: 'Both',
      region: 'EU',
      organizer: users[1]._id, // organizer
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
        { team: teams[3]._id, registeredAt: new Date() },
        { team: teams[4]._id, registeredAt: new Date() },
        { team: teams[5]._id, registeredAt: new Date() },
        { team: teams[6]._id, registeredAt: new Date() },
        { team: teams[7]._id, registeredAt: new Date() },
      ],
      hasQualifiers: true,
      qualifierSettings: {
        numberOfGroups: 2,
        qualifiersPerGroup: 5,
        gamesPerGroup: 3,
        transferNonQualified: true,
      },
      qualifierGroups: [
        {
          groupName: 'Group A',
          groupOrder: 1,
          teams: [teams[0]._id, teams[1]._id, teams[2]._id, teams[3]._id, teams[4]._id],
          games: [
            { gameNumber: 1, status: 'scheduled', results: [] },
            { gameNumber: 2, status: 'scheduled', results: [] },
            { gameNumber: 3, status: 'scheduled', results: [] },
          ],
          standings: [
            { team: teams[0]._id, totalPoints: 45, totalKills: 12, avgPlacement: 2.5, gamesPlayed: 2, qualified: true },
            { team: teams[1]._id, totalPoints: 38, totalKills: 10, avgPlacement: 3.2, gamesPlayed: 2, qualified: true },
            { team: teams[2]._id, totalPoints: 35, totalKills: 9, avgPlacement: 3.8, gamesPlayed: 2, qualified: true },
            { team: teams[3]._id, totalPoints: 32, totalKills: 8, avgPlacement: 4.2, gamesPlayed: 2, qualified: true },
            { team: teams[4]._id, totalPoints: 28, totalKills: 7, avgPlacement: 5.0, gamesPlayed: 2, qualified: true },
          ],
        },
        {
          groupName: 'Group B',
          groupOrder: 2,
          teams: [teams[5]._id, teams[6]._id, teams[7]._id],
          games: [
            { gameNumber: 1, status: 'scheduled', results: [] },
            { gameNumber: 2, status: 'scheduled', results: [] },
            { gameNumber: 3, status: 'scheduled', results: [] },
          ],
          standings: [
            { team: teams[5]._id, totalPoints: 40, totalKills: 11, avgPlacement: 2.0, gamesPlayed: 2, qualified: false },
            { team: teams[6]._id, totalPoints: 30, totalKills: 8, avgPlacement: 4.5, gamesPlayed: 2, qualified: false },
            { team: teams[7]._id, totalPoints: 25, totalKills: 6, avgPlacement: 5.5, gamesPlayed: 2, qualified: false },
          ],
        },
      ],
      qualifiedTeams: [teams[0]._id, teams[1]._id, teams[2]._id, teams[3]._id, teams[4]._id],
    },
    
    // 4. Tournoi ongoing - avec standings en cours
    {
      name: 'Weekly Showdown',
      description: 'Weekly competitive tournament',
      format: 'points-based',
      gameMode: 'Squad',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 10,
      numberOfGames: 6,
      prizePool: 10000,
      startDate: now,
      endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      status: 'ongoing',
      tier: 'Tier 2',
      region: 'EU',
      organizer: users[2]._id, // organizer2
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
      ],
      hasQualifiers: false,
      games: [
        {
          gameNumber: 1,
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[0]._id, placement: 1, kills: 8, placementPoints: 20, killPoints: 8, totalPoints: 28 },
            { team: teams[1]._id, placement: 2, kills: 6, placementPoints: 15, killPoints: 6, totalPoints: 21 },
            { team: teams[2]._id, placement: 3, kills: 4, placementPoints: 12, killPoints: 4, totalPoints: 16 },
            { team: teams[3]._id, placement: 4, kills: 3, placementPoints: 10, killPoints: 3, totalPoints: 13 },
            { team: teams[4]._id, placement: 5, kills: 2, placementPoints: 8, killPoints: 2, totalPoints: 10 },
          ],
          mapName: 'Arena Alpha',
        },
        {
          gameNumber: 2,
          date: new Date(now.getTime() - 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[1]._id, placement: 1, kills: 10, placementPoints: 20, killPoints: 10, totalPoints: 30 },
            { team: teams[0]._id, placement: 2, kills: 7, placementPoints: 15, killPoints: 7, totalPoints: 22 },
            { team: teams[2]._id, placement: 4, kills: 5, placementPoints: 10, killPoints: 5, totalPoints: 15 },
            { team: teams[3]._id, placement: 3, kills: 4, placementPoints: 12, killPoints: 4, totalPoints: 16 },
            { team: teams[4]._id, placement: 5, kills: 3, placementPoints: 8, killPoints: 3, totalPoints: 11 },
          ],
          mapName: 'Arena Beta',
        },
      ],
      standings: [
        { team: teams[1]._id, totalPoints: 51, totalKills: 16, avgPlacement: 1.5, wins: 1, gamesPlayed: 2 },
        { team: teams[0]._id, totalPoints: 50, totalKills: 15, avgPlacement: 1.5, wins: 1, gamesPlayed: 2 },
        { team: teams[2]._id, totalPoints: 31, totalKills: 9, avgPlacement: 3.5, wins: 0, gamesPlayed: 2 },
        { team: teams[3]._id, totalPoints: 29, totalKills: 7, avgPlacement: 3.5, wins: 0, gamesPlayed: 2 },
        { team: teams[4]._id, totalPoints: 21, totalKills: 5, avgPlacement: 5.0, wins: 0, gamesPlayed: 2 },
      ],
    },
    
    // 5. Tournoi completed - avec final standings
    {
      name: 'Spring Invitational 2025',
      description: 'Completed tournament with full results',
      format: 'points-based',
      gameMode: 'Squad',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 10,
      numberOfGames: 6,
      prizePool: 30000,
      startDate: lastWeek,
      endDate: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      tier: 'Tier 1',
      region: 'EU',
      organizer: users[0]._id, // admin
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
        { team: teams[3]._id, registeredAt: new Date() },
        { team: teams[4]._id, registeredAt: new Date() },
      ],
      hasQualifiers: false,
      games: [
        {
          gameNumber: 1,
          date: new Date(lastWeek.getTime() + 2 * 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[0]._id, placement: 1, kills: 12, placementPoints: 20, killPoints: 12, totalPoints: 32 },
            { team: teams[1]._id, placement: 3, kills: 8, placementPoints: 12, killPoints: 8, totalPoints: 20 },
            { team: teams[2]._id, placement: 5, kills: 6, placementPoints: 8, killPoints: 6, totalPoints: 14 },
            { team: teams[3]._id, placement: 4, kills: 5, placementPoints: 10, killPoints: 5, totalPoints: 15 },
            { team: teams[4]._id, placement: 2, kills: 7, placementPoints: 15, killPoints: 7, totalPoints: 22 },
          ],
          mapName: 'Arena Alpha',
        },
        {
          gameNumber: 2,
          date: new Date(lastWeek.getTime() + 4 * 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[1]._id, placement: 1, kills: 10, placementPoints: 20, killPoints: 10, totalPoints: 30 },
            { team: teams[0]._id, placement: 2, kills: 9, placementPoints: 15, killPoints: 9, totalPoints: 24 },
            { team: teams[2]._id, placement: 4, kills: 7, placementPoints: 10, killPoints: 7, totalPoints: 17 },
            { team: teams[3]._id, placement: 3, kills: 6, placementPoints: 12, killPoints: 6, totalPoints: 18 },
            { team: teams[4]._id, placement: 5, kills: 5, placementPoints: 8, killPoints: 5, totalPoints: 13 },
          ],
          mapName: 'Arena Beta',
        },
        {
          gameNumber: 3,
          date: new Date(lastWeek.getTime() + 6 * 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[0]._id, placement: 1, kills: 11, placementPoints: 20, killPoints: 11, totalPoints: 31 },
            { team: teams[2]._id, placement: 2, kills: 9, placementPoints: 15, killPoints: 9, totalPoints: 24 },
            { team: teams[1]._id, placement: 3, kills: 7, placementPoints: 12, killPoints: 7, totalPoints: 19 },
            { team: teams[4]._id, placement: 4, kills: 6, placementPoints: 10, killPoints: 6, totalPoints: 16 },
            { team: teams[3]._id, placement: 5, kills: 5, placementPoints: 8, killPoints: 5, totalPoints: 13 },
          ],
          mapName: 'Arena Gamma',
        },
      ],
      standings: [
        { team: teams[0]._id, totalPoints: 87, totalKills: 32, avgPlacement: 1.33, wins: 2, gamesPlayed: 3 },
        { team: teams[1]._id, totalPoints: 69, totalKills: 25, avgPlacement: 2.33, wins: 1, gamesPlayed: 3 },
        { team: teams[2]._id, totalPoints: 55, totalKills: 22, avgPlacement: 3.67, wins: 0, gamesPlayed: 3 },
        { team: teams[3]._id, totalPoints: 48, totalKills: 18, avgPlacement: 4.33, wins: 0, gamesPlayed: 3 },
        { team: teams[4]._id, totalPoints: 42, totalKills: 15, avgPlacement: 5.0, wins: 0, gamesPlayed: 3 },
      ],
      prizeDistribution: [
        { placement: 1, percentage: 50 },
        { placement: 2, percentage: 30 },
        { placement: 3, percentage: 20 },
      ],
    },
    
    // 6. Tournoi avec qualifiers et finale complète
    {
      name: 'Championship Qualifier Finals',
      description: 'Final qualification tournament with multiple groups',
      format: 'points-based',
      gameMode: 'Trio',
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1,
      },
      maxTeams: 12,
      numberOfGames: 4,
      prizePool: 20000,
      startDate: lastWeek,
      endDate: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
      status: 'completed',
      tier: 'Tier 1',
      region: 'NA',
      organizer: users[1]._id, // organizer
      registeredTeams: [
        { team: teams[0]._id, registeredAt: new Date() },
        { team: teams[1]._id, registeredAt: new Date() },
        { team: teams[2]._id, registeredAt: new Date() },
        { team: teams[3]._id, registeredAt: new Date() },
        { team: teams[4]._id, registeredAt: new Date() },
      ],
      hasQualifiers: true,
      qualifierSettings: {
        numberOfGroups: 2,
        qualifiersPerGroup: 1,
        gamesPerGroup: 3,
        transferNonQualified: false,
      },
      qualifierGroups: [
        {
          groupName: 'Group A',
          groupOrder: 1,
          teams: [teams[0]._id, teams[1]._id],
          games: [
            { gameNumber: 1, status: 'completed', results: [] },
            { gameNumber: 2, status: 'completed', results: [] },
            { gameNumber: 3, status: 'completed', results: [] },
          ],
          standings: [
            { team: teams[0]._id, totalPoints: 85, totalKills: 25, avgPlacement: 1.5, gamesPlayed: 3, qualified: true },
            { team: teams[1]._id, totalPoints: 65, totalKills: 20, avgPlacement: 2.5, gamesPlayed: 3, qualified: false },
          ],
        },
        {
          groupName: 'Group B',
          groupOrder: 2,
          teams: [teams[2]._id],
          games: [
            { gameNumber: 1, status: 'completed', results: [] },
            { gameNumber: 2, status: 'completed', results: [] },
            { gameNumber: 3, status: 'completed', results: [] },
          ],
          standings: [
            { team: teams[2]._id, totalPoints: 70, totalKills: 18, avgPlacement: 2.0, gamesPlayed: 3, qualified: true },
          ],
        },
      ],
      qualifiedTeams: [teams[0]._id, teams[2]._id],
      games: [
        {
          gameNumber: 1,
          date: new Date(lastWeek.getTime() + 8 * 60 * 60 * 1000),
          status: 'completed',
          results: [
            { team: teams[0]._id, placement: 1, kills: 10, placementPoints: 20, killPoints: 10, totalPoints: 30 },
            { team: teams[2]._id, placement: 2, kills: 8, placementPoints: 15, killPoints: 8, totalPoints: 23 },
            { team: teams[1]._id, placement: 3, kills: 7, placementPoints: 12, killPoints: 7, totalPoints: 19 },
            { team: teams[3]._id, placement: 4, kills: 6, placementPoints: 10, killPoints: 6, totalPoints: 16 },
            { team: teams[4]._id, placement: 5, kills: 5, placementPoints: 8, killPoints: 5, totalPoints: 13 },
          ],
          mapName: 'Arena Alpha',
        },
      ],
      standings: [
        { team: teams[0]._id, totalPoints: 30, totalKills: 10, avgPlacement: 1.0, wins: 1, gamesPlayed: 1 },
        { team: teams[2]._id, totalPoints: 23, totalKills: 8, avgPlacement: 2.0, wins: 0, gamesPlayed: 1 },
        { team: teams[1]._id, totalPoints: 19, totalKills: 7, avgPlacement: 3.0, wins: 0, gamesPlayed: 1 },
        { team: teams[3]._id, totalPoints: 16, totalKills: 6, avgPlacement: 4.0, wins: 0, gamesPlayed: 1 },
        { team: teams[4]._id, totalPoints: 13, totalKills: 5, avgPlacement: 5.0, wins: 0, gamesPlayed: 1 },
      ],
    },
  ];

  await Tournament.insertMany(tournaments);
  console.log('✅ Tournaments seeded');
};

const seedScrims = async (users, teams) => {
  const scrims = [
    {
      organizer: users[1]._id, // organizer
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '18:00',
      region: 'EU',
      numberOfGames: 3,
      maxTeams: 10,
      status: 'confirmed',
      participants: [
        { team: teams[0]._id, status: 'confirmed' },
        { team: teams[1]._id, status: 'confirmed' },
      ],
    },
  ];

  await Scrim.insertMany(scrims);
  console.log('✅ Scrims seeded');
};

const seedListings = async (users) => {
  const listings = [
    {
      author: users[7]._id, // FreeAgent
      type: 'LFT',
      title: 'Experienced DPS looking for competitive team',
      description: 'Former semi-pro player seeking active team for scrims and tournaments',
      roles: ['DPS', 'Flex'],
      region: 'EU',
      availability: 'Evenings and weekends',
      contact: { discord: 'FreeAgent#1234', twitter: '@freeagent' },
      status: 'active',
    },
    {
      author: users[3]._id, // ProPlayer1
      type: 'LFP',
      title: 'Team Apex looking for Support main',
      description: 'Top 10 EU team needs skilled support player',
      requirements: 'Must have tournament experience',
      roles: ['Support'],
      region: 'EU',
      availability: 'Daily scrims 6-10 PM CET',
      contact: { discord: 'ProPlayer1#5678' },
      status: 'active',
    },
  ];

  await Listing.insertMany(listings);
  console.log('✅ Listings seeded');
};

const seedAnnouncements = async (users) => {
  const announcements = [
    {
      author: users[0]._id, // admin
      title: 'Welcome to Supervive Competitive Platform!',
      content: 'Join scrims, tournaments, and climb the leaderboards. Good luck!',
      type: 'global',
    },
    {
      author: users[3]._id, // ProPlayer1
      title: 'Team Apex recruiting new players',
      content: 'We are looking for skilled DPS and Support players. Apply now!',
      type: 'team',
      team: null, // Will be set after teams are created
    },
  ];

  await Announcement.insertMany(announcements);
  console.log('✅ Announcements seeded');
};

const seedAll = async () => {
  try {
    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    await seedHeroes();
    const teams = await seedTeams(users);
    const players = await seedPlayers(users, teams);
    await seedPlayerStats(players);
    await seedTeamStats(teams);
    await seedTournaments(users, teams);
    await seedScrims(users, teams);
    await seedListings(users);
    await seedAnnouncements(users);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Test credentials:');
    console.log('   Admin:     admin@supervive.gg / password123');
    console.log('   Organizer: organizer@supervive.gg / password123');
    console.log('   Organizer2: organizer2@supervive.gg / password123');
    console.log('   Player:    player1@supervive.gg / password123');
    console.log('   Viewer:    viewer1@supervive.gg / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
