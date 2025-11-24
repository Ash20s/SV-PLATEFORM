/**
 * Utilitaires pour maintenir la connexion MongoDB active
 */

const mongoose = require('mongoose');

// Ping MongoDB toutes les 30 secondes pour maintenir la connexion
let keepAliveInterval = null;

function startKeepAlive() {
  if (keepAliveInterval) {
    return; // Déjà démarré
  }

  keepAliveInterval = setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        // Connexion active, on fait un ping
        await mongoose.connection.db.admin().ping();
      } else if (mongoose.connection.readyState === 0) {
        // Connexion perdue, on reconnecte
        console.log('🔄 Reconnexion à MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ MongoDB reconnecté');
      }
    } catch (error) {
      console.error('⚠️  Erreur keep-alive MongoDB:', error.message);
    }
  }, 30000); // Toutes les 30 secondes

  console.log('✅ Keep-alive MongoDB activé');
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🛑 Keep-alive MongoDB arrêté');
  }
}

// Gestion de la reconnexion automatique
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB déconnecté, tentative de reconnexion...');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur MongoDB:', error.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnecté');
});

module.exports = {
  startKeepAlive,
  stopKeepAlive,
};

