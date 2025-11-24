/**
 * Script pour vérifier l'état de la base de données
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supervive';

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données...\n');
  console.log(`URI: ${MONGODB_URI}\n`);

  try {
    // Connexion
    console.log('1️⃣ Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier les collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('2️⃣ Collections disponibles:');
    console.log(`   Total: ${collections.length}\n`);
    
    if (collections.length === 0) {
      console.log('⚠️  Aucune collection trouvée - La base de données est vide\n');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
      console.log('');
    }

    // Vérifier les modèles principaux
    console.log('3️⃣ Vérification des données principales:\n');
    
    const models = {
      'users': 'User',
      'teams': 'Team',
      'tournaments': 'Tournament',
      'scrims': 'Scrim',
      'matches': 'Match',
      'playerstats': 'PlayerStats',
    };

    for (const [collectionName, modelName] of Object.entries(models)) {
      try {
        const Model = require(`./src/models/${modelName}.js`);
        const count = await Model.countDocuments();
        console.log(`   ${modelName.padEnd(15)}: ${count} documents`);
      } catch (error) {
        // Modèle non trouvé, ignorer
      }
    }

    console.log('\n✅ Vérification terminée');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('\n⚠️  MongoDB n\'est pas accessible !');
      console.error('   Vérifiez que MongoDB est démarré:');
      console.error('   - Windows: Vérifiez les services ou démarrez MongoDB');
      console.error('   - URI utilisée:', MONGODB_URI);
    }
    
    process.exit(1);
  }
}

checkDatabase();

