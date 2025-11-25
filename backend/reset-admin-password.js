require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');

    // Trouver l'admin
    let admin = await User.findOne({ username: 'admin' });

    if (!admin) {
      // Créer un nouvel admin si inexistant
      console.log('❌ Aucun admin trouvé. Création d\'un nouveau compte admin...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      admin = new User({
        username: 'admin',
        email: 'admin@supervive.gg',
        password: hashedPassword,
        role: 'admin',
        profile: {
          ign: 'Admin',
          region: 'EU'
        }
      });
      
      await admin.save();
      console.log('✅ Nouveau compte admin créé !');
    } else {
      // Réinitialiser le mot de passe
      console.log('✅ Admin trouvé. Réinitialisation du mot de passe...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✅ Mot de passe réinitialisé !');
    }

    console.log('\n🔐 Identifiants de connexion :');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n💡 Connectez-vous avec ces identifiants sur http://localhost:5173/login');

    // Test du mot de passe
    const testPassword = await bcrypt.compare('admin123', admin.password);
    console.log('\n✅ Test du mot de passe:', testPassword ? 'OK ✓' : 'ÉCHEC ✗');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetAdminPassword();

