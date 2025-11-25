// Script pour mocker temporairement le service Twitch et retourner des streams de test
// Ce script modifie temporairement twitchService.js pour retourner des faux streams

const fs = require('fs');
const path = require('path');

const mockStreams = `
  /**
   * Get live streams from platform users (MOCKED FOR TESTING)
   */
  async getLiveStreams(users) {
    console.log('🎭 Mode MOCK activé - Retour de streams de test');
    
    // Retourner des streams de test
    return [
      {
        userId: '123456789',
        userName: 'pro_gamer_phoenix',
        userDisplayName: 'ProGamerPhoenix',
        title: '🔥 SNS Turbo Cup - Final Day! Road to Victory',
        viewerCount: 1247,
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_pro_gamer_phoenix-440x248.jpg',
        gameId: '517826',
        gameName: 'Supervive',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
        platformUser: {
          id: 'user_id_1',
          username: 'player1',
          avatar: '/uploads/avatars/default-avatar.jpg',
        },
      },
      {
        userId: '987654321',
        userName: 'shadow_hunter_2024',
        userDisplayName: 'ShadowHunter',
        title: 'Chill Vibes 🎮 | Ranked Grind | !discord !team',
        viewerCount: 856,
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shadow_hunter_2024-440x248.jpg',
        gameId: '517826',
        gameName: 'Supervive',
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Il y a 4h
        platformUser: {
          id: 'user_id_2',
          username: 'player2',
          avatar: '/uploads/avatars/default-avatar.jpg',
        },
      },
      {
        userId: '456789123',
        userName: 'viper_squad_tv',
        userDisplayName: 'ViperSquadTV',
        title: 'Team Practice 💪 Preparing for Major Championship',
        viewerCount: 432,
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_viper_squad_tv-440x248.jpg',
        gameId: '517826',
        gameName: 'Supervive',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
        platformUser: {
          id: 'user_id_3',
          username: 'player3',
          avatar: '/uploads/avatars/default-avatar.jpg',
        },
      },
      {
        userId: '789123456',
        userName: 'thunder_strikes',
        userDisplayName: 'ThunderStrikes',
        title: 'Morning Stream ☕ Learning New Strategies',
        viewerCount: 234,
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_thunder_strikes-440x248.jpg',
        gameId: '517826',
        gameName: 'Supervive',
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Il y a 30min
        platformUser: {
          id: 'user_id_4',
          username: 'player4',
          avatar: '/uploads/avatars/default-avatar.jpg',
        },
      },
      {
        userId: '321654987',
        userName: 'midnight_legends',
        userDisplayName: 'MidnightLegends',
        title: 'Late Night Grind 🌙 | Tier 1 Tournament Tomorrow',
        viewerCount: 187,
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_midnight_legends-440x248.jpg',
        gameId: '517826',
        gameName: 'Supervive',
        startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Il y a 6h
        platformUser: {
          id: 'user_id_5',
          username: 'player5',
          avatar: '/uploads/avatars/default-avatar.jpg',
        },
      },
    ];
  }
`;

const serviceFilePath = path.join(__dirname, 'src', 'services', 'twitchService.js');
const backupFilePath = path.join(__dirname, 'src', 'services', 'twitchService.js.backup');

console.log('🎭 Configuration du mode MOCK pour les streams Twitch\n');

// Lire le fichier original
const originalContent = fs.readFileSync(serviceFilePath, 'utf8');

// Sauvegarder l'original
fs.writeFileSync(backupFilePath, originalContent, 'utf8');
console.log('✅ Backup créé: twitchService.js.backup');

// Remplacer la fonction getLiveStreams
const modifiedContent = originalContent.replace(
  /\/\*\*\s*\n\s*\* Get live streams from platform users[\s\S]*?\n\s*\}/m,
  mockStreams
);

fs.writeFileSync(serviceFilePath, modifiedContent, 'utf8');
console.log('✅ Service Twitch modifié avec des streams de test');
console.log('\n📺 Streams de test disponibles:');
console.log('   1. ProGamerPhoenix (1,247 viewers)');
console.log('   2. ShadowHunter (856 viewers)');
console.log('   3. ViperSquadTV (432 viewers)');
console.log('   4. ThunderStrikes (234 viewers)');
console.log('   5. MidnightLegends (187 viewers)');
console.log('\n🔄 Redémarrez le backend (nodemon le fera automatiquement)');
console.log('🌐 Rafraîchissez votre navigateur sur http://localhost:5173');
console.log('\n⚠️  Pour revenir au mode normal, exécutez: node restore-twitch-service.js');

