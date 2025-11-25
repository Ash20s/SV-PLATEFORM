import api from './api';

export interface TwitchStream {
  userId: string;
  userName: string;
  userDisplayName: string;
  title: string;
  viewerCount: number;
  thumbnailUrl: string;
  gameId: string;
  gameName: string;
  startedAt: string;
  platformUser: {
    id: string;
    username: string;
    avatar: string;
  };
}

export const twitchService = {
  /**
   * Get Twitch authorization URL
   */
  getAuthUrl: async (): Promise<string> => {
    const response = await api.get('/twitch/auth-url');
    return response.data.authUrl;
  },

  /**
   * Handle Twitch OAuth callback
   */
  handleCallback: async (code: string) => {
    const response = await api.post('/twitch/callback', { code });
    return response.data;
  },

  /**
   * Unlink Twitch account
   */
  unlinkAccount: async () => {
    const response = await api.delete('/twitch/unlink');
    return response.data;
  },

  /**
   * Get live streams from platform users
   */
  getLiveStreams: async (): Promise<TwitchStream[]> => {
    try {
      const response = await api.get('/twitch/live-streams');
      return response.data.streams || [];
    } catch (error) {
      console.error('Error fetching live streams:', error);
      return [];
    }
  },

  /**
   * Check if current user is streaming
   */
  getMyStream: async () => {
    const response = await api.get('/twitch/my-stream');
    return response.data;
  },

  /**
   * Open Twitch OAuth popup
   */
  openAuthPopup: async () => {
    const authUrl = await twitchService.getAuthUrl();
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      authUrl,
      'Twitch Authentication',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  },
};

