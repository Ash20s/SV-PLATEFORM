require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');
const Announcement = require('./src/models/Announcement');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');
    
    const tournamentCount = await Tournament.countDocuments();
    const announcementCount = await Announcement.countDocuments();
    
    console.log(`📊 Statistiques :`);
    console.log(`   - Tournois : ${tournamentCount}`);
    console.log(`   - Annonces : ${announcementCount}\n`);
    
    if (tournamentCount > 0) {
      console.log('🏆 Tournois disponibles :');
      const tournaments = await Tournament.find().limit(5).select('name status startDate registeredTeams');
      tournaments.forEach(t => {
        console.log(`   - ${t.name}`);
        console.log(`     Status: ${t.status} | Date: ${new Date(t.startDate).toLocaleDateString()}`);
        console.log(`     Teams: ${t.registeredTeams?.length || 0}\n`);
      });
    }
    
    if (announcementCount > 0) {
      console.log('📢 Annonces :');
      const announcements = await Announcement.find().limit(3).select('title');
      announcements.forEach(a => {
        console.log(`   - ${a.title}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkData();

