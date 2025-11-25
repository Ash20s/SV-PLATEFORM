require('dotenv').config();
const mongoose = require('mongoose');
const Scrim = require('./src/models/Scrim');
const User = require('./src/models/User');

async function seedScrims() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    // Trouver un utilisateur pour être l'organisateur
    let organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      organizer = await User.findOne({ role: 'admin' });
    }
    if (!organizer) {
      console.log('❌ Aucun organisateur trouvé. Créez d\'abord un utilisateur organizer ou admin.');
      process.exit(1);
    }

    console.log(`📝 Organisateur trouvé: ${organizer.username}\n`);

    // Supprimer les anciens scrims de test
    await Scrim.deleteMany({});
    console.log('🗑️  Anciens scrims supprimés\n');

    // Créer des scrims pour les 2 prochaines semaines
    const scrims = [];
    const today = new Date();
    
    // Scrim dans 2 jours
    scrims.push({
      organizer: organizer._id,
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '20:00',
      region: 'EU',
      tier: 'Both',
      gameMode: 'Trio',
      maxTeams: 12,
      status: 'open'
    });

    // Scrim dans 4 jours
    scrims.push({
      organizer: organizer._id,
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
      time: '19:00',
      region: 'NA',
      tier: 'Tier 2',
      gameMode: 'Squad',
      maxTeams: 10,
      status: 'open'
    });

    // Scrim dans 7 jours
    scrims.push({
      organizer: organizer._id,
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      time: '21:00',
      region: 'EU',
      tier: 'Tier 1',
      gameMode: 'Trio',
      maxTeams: 12,
      status: 'pending'
    });

    // Scrim dans 10 jours
    scrims.push({
      organizer: organizer._id,
      date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      time: '18:30',
      region: 'NA',
      tier: 'Both',
      gameMode: 'Squad',
      maxTeams: 10,
      status: 'open'
    });

    // Scrim dans 14 jours
    scrims.push({
      organizer: organizer._id,
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      time: '20:00',
      region: 'EU',
      tier: 'Tier 2',
      gameMode: 'Trio',
      maxTeams: 12,
      status: 'open'
    });

    // Insérer les scrims
    const createdScrims = await Scrim.insertMany(scrims);
    
    console.log('🎉 Scrims créés avec succès !\n');
    console.log('📅 Scrims créés :');
    createdScrims.forEach((scrim, index) => {
      console.log(`   ${index + 1}. ${scrim.tier} - ${scrim.gameMode} - ${scrim.region}`);
      console.log(`      Date: ${scrim.date.toLocaleDateString()} à ${scrim.time}`);
      console.log(`      Status: ${scrim.status}`);
      console.log('');
    });

    console.log('✅ Terminé ! Allez sur /calendar pour voir les scrims.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedScrims();

