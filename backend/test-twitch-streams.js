require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function addTwitchTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supervive-platform');
    console.log('✅ Connecté à MongoDB\n');
    
    // Trouver quelques joueurs existants
    const players = await User.find({ role: 'player' }).limit(5);
    
    if (players.length === 0) {
      console.log('❌ Aucun joueur trouvé. Exécutez d\'abord seed-full-data.js');
      process.exit(1);
    }
    
    console.log('🎮 Ajout de comptes Twitch de test...\n');
    
    // Données Twitch fictives
    const twitchTestData = [
      {
        twitchId: '123456789',
        twitchUsername: 'pro_gamer_phoenix',
        twitchDisplayName: 'ProGamerPhoenix',
      },
      {
        twitchId: '987654321',
        twitchUsername: 'shadow_hunter_2024',
        twitchDisplayName: 'ShadowHunter',
      },
      {
        twitchId: '456789123',
        twitchUsername: 'viper_squad_tv',
        twitchDisplayName: 'ViperSquadTV',
      },
      {
        twitchId: '789123456',
        twitchUsername: 'thunder_strikes',
        twitchDisplayName: 'ThunderStrikes',
      },
      {
        twitchId: '321654987',
        twitchUsername: 'midnight_legends',
        twitchDisplayName: 'MidnightLegends',
      },
    ];
    
    for (let i = 0; i < Math.min(players.length, twitchTestData.length); i++) {
      const player = players[i];
      const twitchData = twitchTestData[i];
      
      player.twitchAuth = {
        twitchId: twitchData.twitchId,
        twitchUsername: twitchData.twitchUsername,
        twitchDisplayName: twitchData.twitchDisplayName,
        accessToken: 'fake_access_token_' + Date.now(),
        refreshToken: 'fake_refresh_token_' + Date.now(),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        isStreaming: false,
        lastStreamCheck: new Date(),
      };
      
      // Aussi ajouter dans les socials
      if (!player.profile.socials) {
        player.profile.socials = {};
      }
      player.profile.socials.twitch = twitchData.twitchUsername;
      
      await player.save();
      
      console.log(`✅ ${player.username} → Twitch: ${twitchData.twitchDisplayName}`);
    }
    
    console.log('\n🎉 Comptes Twitch de test ajoutés !');
    console.log('\n📝 Note: Ces comptes ne sont pas réellement en live.');
    console.log('   Pour voir le carrousel, vous devez :');
    console.log('   1. Avoir des credentials Twitch valides dans .env');
    console.log('   2. OU modifier le service Twitch pour retourner des streams de test');
    console.log('\n💡 Astuce: Exécutez "node test-twitch-mock-streams.js" pour simuler des streams live');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addTwitchTestData();

