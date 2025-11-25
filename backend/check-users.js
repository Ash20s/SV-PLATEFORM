require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');
    
    const adminUser = await User.findOne({ username: 'admin' });
    const playerCount = await User.countDocuments({ role: 'player' });
    
    console.log('👤 Utilisateurs :');
    console.log(`   - Total joueurs : ${playerCount}`);
    
    if (adminUser) {
      console.log('\n✅ Compte Admin trouvé :');
      console.log(`   - Username: admin`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      
      // Tester le mot de passe
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, adminUser.password);
      
      if (isValid) {
        console.log(`\n✅ Mot de passe "password123" est VALIDE`);
        console.log(`\n🔐 Credentials de connexion :`);
        console.log(`   Username: admin`);
        console.log(`   Password: password123`);
      } else {
        console.log(`\n❌ Mot de passe "password123" est INVALIDE`);
        console.log(`\n🔧 Réinitialisation du mot de passe...`);
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser.password = hashedPassword;
        await adminUser.save();
        
        console.log(`✅ Mot de passe réinitialisé !`);
        console.log(`\n🔐 Nouveaux credentials :`);
        console.log(`   Username: admin`);
        console.log(`   Password: password123`);
      }
    } else {
      console.log('\n❌ Aucun compte admin trouvé !');
      console.log('\n🔧 Création du compte admin...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@supervive.gg',
        password: hashedPassword,
        role: 'admin',
        profile: {
          bio: 'Platform Administrator',
          country: 'FR',
        },
      });
      
      console.log('✅ Compte admin créé !');
      console.log(`\n🔐 Credentials de connexion :`);
      console.log(`   Username: admin`);
      console.log(`   Password: password123`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkUsers();
