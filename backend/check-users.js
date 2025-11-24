const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/supervise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
}, { collection: 'users' });

const teamSchema = new mongoose.Schema({
  name: String,
  tag: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { collection: 'teams' });

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);

async function checkData() {
  try {
    console.log('\n=== USERS ===');
    const users = await User.find().populate('teamId');
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé');
    } else {
      users.forEach(u => {
        console.log(`- ${u.username} (${u.role})`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Team: ${u.teamId?.name || 'Aucune équipe'}`);
        console.log('');
      });
    }

    console.log('\n=== TEAMS ===');
    const teams = await Team.find().populate('members');
    if (teams.length === 0) {
      console.log('Aucune équipe trouvée');
    } else {
      teams.forEach(t => {
        console.log(`- ${t.name} [${t.tag}]`);
        console.log(`  Members: ${t.members?.map(m => m.username).join(', ') || 'Aucun membre'}`);
        console.log('');
      });
    }

    console.log('\n=== INSTRUCTIONS ===');
    console.log('Pour avoir des stats :');
    console.log('1. Créez un compte sur /register');
    console.log('2. Créez ou rejoignez une équipe');
    console.log('3. Participez à des tournois avec votre équipe');
    console.log('4. Consultez l\'onglet "Stats" pour voir vos statistiques\n');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
