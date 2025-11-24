const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');

mongoose.connect('mongodb://localhost:27017/supervise', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAPI() {
  try {
    const tournament = await Tournament.findOne({})
      .populate('organizer', 'username profile')
      .populate('registeredTeams.team', 'name tag logo stats')
      .populate('standings.team', 'name tag logo')
      .populate('games.results.team', 'name tag logo');
    
    console.log('\n📊 Tournoi récupéré:');
    console.log('Nom:', tournament.name);
    console.log('\nCheckInSettings (brut):');
    console.log(tournament.checkInSettings);
    
    console.log('\nCheckInSettings (JSON.stringify):');
    const jsonTournament = JSON.parse(JSON.stringify(tournament));
    console.log(jsonTournament.checkInSettings);
    
    console.log('\nOpensAt (objet Date):', tournament.checkInSettings.opensAt);
    console.log('OpensAt (JSON):', jsonTournament.checkInSettings.opensAt);
    console.log('OpensAt (toISOString):', tournament.checkInSettings.opensAt.toISOString());
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté');
  }
}

testAPI();
