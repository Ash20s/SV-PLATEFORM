require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
const User = require('./src/models/User');
const Team = require('./src/models/Team');

/**
 * Script pour seed des annonces LFT/LFP
 */

async function seedListings() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer quelques utilisateurs et équipes
    const users = await User.find().limit(10);
    const teams = await Team.find().limit(5);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Veuillez d\'abord créer des utilisateurs.');
      process.exit(1);
    }

    // Supprimer les anciennes annonces
    await Listing.deleteMany({});
    console.log('🧹 Anciennes annonces supprimées\n');

    const listingsData = [
      // LFT Listings
      {
        type: 'LFT',
        author: users[0]._id,
        title: 'T1 Hunter LFT - Competitive Player',
        description: 'Experienced hunter main looking for a serious T1 team. I have experience in multiple tournaments and scrims. Strong communication and game sense. Available for daily practice.',
        tier: 'Tier 1',
        region: 'EU',
        roles: ['Hunter', 'DPS'],
        availability: 'Weekdays 6-11 PM, Weekends flexible',
        contact: {
          discord: 'ProHunter#1234',
          twitter: '@ProHunterGG'
        },
        playerStats: {
          experience: 'Advanced'
        },
        views: 45,
        status: 'active'
      },
      {
        type: 'LFT',
        author: users[1]._id,
        title: 'Flex Player LFT - T1/T2',
        description: 'Versatile player comfortable on multiple heroes. Former team captain with IGL experience. Looking for a team that values strategy and teamwork.',
        tier: 'Both',
        region: 'NA',
        roles: ['Flex', 'Tank', 'Support'],
        availability: 'Daily 8 PM - 12 AM EST',
        contact: {
          discord: 'FlexMaster#5678'
        },
        playerStats: {
          experience: 'Pro'
        },
        views: 32,
        status: 'active'
      },
      {
        type: 'LFT',
        author: users[2]._id,
        title: 'Support Main LFT - EU T2',
        description: 'Dedicated support player with great positioning and team awareness. 2+ years of competitive experience. Looking to improve and compete at higher level.',
        tier: 'Tier 2',
        region: 'EU',
        roles: ['Support'],
        availability: 'Most evenings',
        contact: {
          discord: 'SupportQueen#9999'
        },
        playerStats: {
          experience: 'Intermediate'
        },
        views: 28,
        status: 'active'
      },
      {
        type: 'LFT',
        author: users[3]._id,
        title: 'IGL/Flex LFT - Experienced Shot Caller',
        description: 'In-game leader with tournament wins. Strong at shot-calling, draft, and strategy. Can flex to any role needed. Looking for dedicated team.',
        tier: 'Tier 1',
        region: 'NA',
        roles: ['Flex', 'Any'],
        availability: 'Weekdays 7-11 PM, Full weekends',
        contact: {
          discord: 'IGLPro#4444',
          twitter: '@IGLMaster'
        },
        playerStats: {
          experience: 'Pro'
        },
        views: 67,
        status: 'active'
      }
    ];

    // LFP Listings (pour les équipes qui ont des teams)
    const lfpListings = teams.slice(0, 3).map((team, index) => ({
      type: 'LFP',
      author: team.captain || users[4]._id,
      team: team._id,
      title: `${team.tag} LFP - ${index === 0 ? 'Hunter' : index === 1 ? 'Support' : 'Flex'} Needed`,
      description: `${team.name} is looking for ${index === 0 ? 'a skilled hunter' : index === 1 ? 'a support player' : 'a flex player'} to complete our roster. We're a ${index === 0 ? 'T1' : 'T2'} team with regular scrim schedule and tournament experience. Looking for dedicated player with good attitude.`,
      tier: index === 0 ? 'Tier 1' : 'Tier 2',
      region: index % 2 === 0 ? 'EU' : 'NA',
      roles: [index === 0 ? 'Hunter' : index === 1 ? 'Support' : 'Flex'],
      availability: 'Daily practice 7-10 PM',
      contact: {
        discord: `${team.tag}Captain#${1000 + index}`
      },
      playersNeeded: 1,
      views: 20 + index * 10,
      status: 'active'
    }));

    const allListings = [...listingsData, ...lfpListings];

    // Créer les annonces
    const created = await Listing.insertMany(allListings);
    console.log(`✅ ${created.length} annonces créées !\n`);

    // Afficher un résumé
    const lftCount = created.filter(l => l.type === 'LFT').length;
    const lfpCount = created.filter(l => l.type === 'LFP').length;
    console.log('📊 Résumé:');
    console.log(`   - ${lftCount} annonces LFT (Looking For Team)`);
    console.log(`   - ${lfpCount} annonces LFP (Looking For Players)`);
    console.log(`\n🎉 Les annonces sont maintenant disponibles sur /mercato !`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedListings();

