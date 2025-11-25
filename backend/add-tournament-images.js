require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');

/**
 * Script pour ajouter des images de fond aux tournois
 */

// Images de fond gaming de haute qualité (Unsplash)
const bannerImages = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop&q=80', // Gaming setup
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=1080&fit=crop&q=80', // Team gaming
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop&q=80', // Arena
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&h=1080&fit=crop&q=80', // Competitive
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&h=1080&fit=crop&q=80', // Esports
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1920&h=1080&fit=crop&q=80', // Gaming
];

async function addTournamentImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    const tournaments = await Tournament.find({});
    console.log(`📊 ${tournaments.length} tournois trouvés\n`);

    let updated = 0;

    for (let i = 0; i < tournaments.length; i++) {
      const tournament = tournaments[i];
      
      // Attribuer une image aléatoire ou cyclique
      const imageIndex = i % bannerImages.length;
      tournament.bannerImage = bannerImages[imageIndex];
      
      await tournament.save();
      
      console.log(`✅ ${tournament.name}`);
      console.log(`   Image: ${tournament.bannerImage.substring(0, 60)}...`);
      
      updated++;
    }

    console.log(`\n🎉 ${updated} tournois mis à jour avec des images !`);
    console.log(`\n💡 Les tournois afficheront maintenant de belles images de fond !`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addTournamentImages();

