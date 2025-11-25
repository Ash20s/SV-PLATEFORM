require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');

/**
 * Test différentes URLs d'images Supervive
 */

const imageUrls = [
  'https://cdn.cloudflare.steamstatic.com/steam/apps/2111190/capsule_616x353.jpg',
  'https://cdn.cloudflare.steamstatic.com/steam/apps/2111190/ss_d9201222f8e0bca8cbfb6190a0db98bd19e5ce87.1920x1080.jpg',
  'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2111190/header.jpg',
];

async function testImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    const featured = await Tournament.findOne({ 
      status: { $in: ['open', 'registration', 'upcoming'] } 
    }).sort({ startDate: 1 });

    if (!featured) {
      console.log('❌ Aucun tournoi trouvé');
      process.exit(1);
    }

    console.log('🎮 Images Supervive disponibles:\n');
    imageUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}\n`);
    });

    console.log('\n💡 Pour utiliser une de ces images, exécutez:');
    console.log('   node set-featured-image.js "URL_DE_VOTRE_CHOIX"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testImages();

