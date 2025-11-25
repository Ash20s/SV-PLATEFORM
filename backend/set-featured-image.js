require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');

/**
 * Script rapide pour mettre à jour l'image du featured tournament
 * Usage: node set-featured-image.js <URL_IMAGE>
 */

async function setFeaturedImage() {
  try {
    const imageUrl = process.argv[2];
    
    if (!imageUrl) {
      console.log('\n❌ Erreur : Vous devez fournir une URL d\'image !');
      console.log('\n📝 Usage:');
      console.log('   node set-featured-image.js <URL_IMAGE>');
      console.log('\n💡 Exemple:');
      console.log('   node set-featured-image.js https://i.imgur.com/abc123.jpg');
      console.log('\n📸 Ou utilisez l\'image locale:');
      console.log('   node set-featured-image.js /assets/images/banners/supervive-main-banner.jpg');
      console.log('');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le premier tournoi (featured)
    const featured = await Tournament.findOne({ 
      status: { $in: ['open', 'registration', 'upcoming'] } 
    }).sort({ startDate: 1 });
    
    if (!featured) {
      console.log('❌ Aucun tournoi trouvé');
      
      // Afficher tous les tournois disponibles
      const all = await Tournament.find({}).sort({ startDate: 1 });
      console.log('\n📋 Tournois disponibles:');
      all.forEach(t => {
        console.log(`   - ${t.name} (${t.status})`);
      });
      
      process.exit(1);
    }

    // Mettre à jour l'image
    featured.bannerImage = imageUrl;
    await featured.save();

    console.log('🎉 Image mise à jour avec succès !');
    console.log(`\n📸 Tournoi : ${featured.name}`);
    console.log(`🔗 Image : ${imageUrl}`);
    console.log('\n💡 Rafraîchissez votre navigateur pour voir les changements !');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setFeaturedImage();

