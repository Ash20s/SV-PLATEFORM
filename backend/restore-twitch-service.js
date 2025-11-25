// Script pour restaurer le service Twitch original

const fs = require('fs');
const path = require('path');

const serviceFilePath = path.join(__dirname, 'src', 'services', 'twitchService.js');
const backupFilePath = path.join(__dirname, 'src', 'services', 'twitchService.js.backup');

console.log('🔄 Restauration du service Twitch original\n');

if (!fs.existsSync(backupFilePath)) {
  console.log('❌ Aucun backup trouvé. Le service n\'a pas été modifié ou le backup a été supprimé.');
  process.exit(1);
}

// Restaurer depuis le backup
const backupContent = fs.readFileSync(backupFilePath, 'utf8');
fs.writeFileSync(serviceFilePath, backupContent, 'utf8');

// Supprimer le backup
fs.unlinkSync(backupFilePath);

console.log('✅ Service Twitch restauré');
console.log('✅ Backup supprimé');
console.log('\n🔄 Redémarrez le backend (nodemon le fera automatiquement)');
console.log('📡 Le service utilisera maintenant l\'API Twitch réelle');

