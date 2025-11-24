const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/supervise', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tournamentSchema = new mongoose.Schema({}, { strict: false, collection: 'tournaments' });
const Tournament = mongoose.model('Tournament', tournamentSchema);

async function checkTournament() {
  try {
    const tournaments = await Tournament.find({});
    
    console.log('\n📊 Tournois trouvés:', tournaments.length);
    
    tournaments.forEach((t, i) => {
      console.log(`\n🎮 Tournoi ${i + 1}:`);
      console.log('  Nom:', t.name);
      console.log('  StartDate:', t.startDate);
      console.log('  CheckInSettings:', JSON.stringify(t.checkInSettings, null, 2));
      console.log('  OpensAt type:', typeof t.checkInSettings?.opensAt);
      console.log('  ClosesAt type:', typeof t.checkInSettings?.closesAt);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

checkTournament();
