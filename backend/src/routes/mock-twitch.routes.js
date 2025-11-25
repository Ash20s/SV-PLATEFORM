const express = require('express');
const router = express.Router();

/**
 * Endpoint de test pour simuler des streams Twitch
 * GET /api/mock-twitch/live-streams
 */
router.get('/live-streams', (req, res) => {
  const mockStreams = [
    {
      userId: '123456789',
      userName: 'pro_gamer_phoenix',
      userDisplayName: 'ProGamerPhoenix',
      title: '🔥 SNS Turbo Cup - Final Day! Road to Victory',
      viewerCount: 1247,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjas_in_pyjamas-440x248.jpg',
      gameId: '517826',
      gameName: 'Supervive',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      platformUser: {
        id: 'user_id_1',
        username: 'player1',
        avatar: null,
      },
    },
    {
      userId: '987654321',
      userName: 'shadow_hunter_2024',
      userDisplayName: 'ShadowHunter',
      title: 'Chill Vibes 🎮 | Ranked Grind | !discord !team',
      viewerCount: 856,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_esl_csgo-440x248.jpg',
      gameId: '517826',
      gameName: 'Supervive',
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      platformUser: {
        id: 'user_id_2',
        username: 'player2',
        avatar: null,
      },
    },
    {
      userId: '456789123',
      userName: 'viper_squad_tv',
      userDisplayName: 'ViperSquadTV',
      title: 'Team Practice 💪 Preparing for Major Championship',
      viewerCount: 432,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_riotgames-440x248.jpg',
      gameId: '517826',
      gameName: 'Supervive',
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      platformUser: {
        id: 'user_id_3',
        username: 'player3',
        avatar: null,
      },
    },
    {
      userId: '789123456',
      userName: 'thunder_strikes',
      userDisplayName: 'ThunderStrikes',
      title: 'Morning Stream ☕ Learning New Strategies',
      viewerCount: 234,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_valorant-440x248.jpg',
      gameId: '517826',
      gameName: 'Supervive',
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      platformUser: {
        id: 'user_id_4',
        username: 'player4',
        avatar: null,
      },
    },
    {
      userId: '321654987',
      userName: 'midnight_legends',
      userDisplayName: 'MidnightLegends',
      title: 'Late Night Grind 🌙 | Tier 1 Tournament Tomorrow',
      viewerCount: 187,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud-440x248.jpg',
      gameId: '517826',
      gameName: 'Supervive',
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      platformUser: {
        id: 'user_id_5',
        username: 'player5',
        avatar: null,
      },
    },
  ];

  res.json({ streams: mockStreams });
});

module.exports = router;

