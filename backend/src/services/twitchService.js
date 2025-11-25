const axios = require('axios');

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || 'http://localhost:5173/settings?twitch=callback';

class TwitchService {
  constructor() {
    this.appAccessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get Twitch OAuth authorization URL
   */
  getAuthorizationUrl() {
    const scopes = ['user:read:email'].join(' ');
    return `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: TWITCH_REDIRECT_URI,
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error getting Twitch access token:', error.response?.data || error.message);
      throw new Error('Failed to get Twitch access token');
    }
  }

  /**
   * Refresh user access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing Twitch token:', error.response?.data || error.message);
      throw new Error('Failed to refresh Twitch token');
    }
  }

  /**
   * Get Twitch user info
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const user = response.data.data[0];
      return {
        twitchId: user.id,
        twitchUsername: user.login,
        twitchDisplayName: user.display_name,
        email: user.email,
        profileImageUrl: user.profile_image_url,
      };
    } catch (error) {
      console.error('Error getting Twitch user info:', error.response?.data || error.message);
      throw new Error('Failed to get Twitch user info');
    }
  }

  /**
   * Get app access token (for checking streams without user auth)
   */
  async getAppAccessToken() {
    // Check if we have a valid app token
    if (this.appAccessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.appAccessToken;
    }

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      });

      this.appAccessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
      
      return this.appAccessToken;
    } catch (error) {
      console.error('Error getting app access token:', error.response?.data || error.message);
      throw new Error('Failed to get app access token');
    }
  }

  /**
   * Check if users are currently streaming
   */
  async checkStreams(twitchUserIds) {
    if (!twitchUserIds || twitchUserIds.length === 0) {
      return [];
    }

    try {
      const appToken = await this.getAppAccessToken();
      
      const response = await axios.get('https://api.twitch.tv/helix/streams', {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${appToken}`,
        },
        params: {
          user_id: twitchUserIds.join(','),
          first: 100,
        },
      });

      return response.data.data.map(stream => ({
        userId: stream.user_id,
        userName: stream.user_login,
        userDisplayName: stream.user_name,
        title: stream.title,
        viewerCount: stream.viewer_count,
        thumbnailUrl: stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248'),
        gameId: stream.game_id,
        gameName: stream.game_name,
        startedAt: stream.started_at,
      }));
    } catch (error) {
      console.error('Error checking Twitch streams:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get live streams from platform users
   */
  async getLiveStreams(users) {
    const usersWithTwitch = users.filter(u => u.twitchAuth?.twitchId);
    
    if (usersWithTwitch.length === 0) {
      return [];
    }

    const twitchIds = usersWithTwitch.map(u => u.twitchAuth.twitchId);
    const streams = await this.checkStreams(twitchIds);

    // Match streams with platform users
    return streams.map(stream => {
      const user = usersWithTwitch.find(u => u.twitchAuth.twitchId === stream.userId);
      return {
        ...stream,
        platformUser: {
          id: user._id,
          username: user.username,
          avatar: user.profile?.avatar,
        },
      };
    });
  }
}

module.exports = new TwitchService();

