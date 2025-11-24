/**
 * Script pour tester le démarrage du backend et voir les erreurs
 */

require('dotenv').config();

console.log('🔍 Test de démarrage du backend...\n');

// Vérifier les variables d'environnement
console.log('1️⃣ Variables d\'environnement:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI || 'NON DÉFINI');
console.log('   PORT:', process.env.PORT || '5000');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'NON DÉFINI');
console.log('');

// Tester la connexion MongoDB
console.log('2️⃣ Test de connexion MongoDB...');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supervive';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('   ✅ MongoDB connecté');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('   ❌ Erreur MongoDB:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   ⚠️  MongoDB n\'est pas démarré !');
      console.error('   Démarrez MongoDB avec: Start-Service MongoDB');
    }
    process.exit(1);
  });

