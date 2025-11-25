const User = require('../models/User');
const twitchService = require('../services/twitchService');

/**
 * Get Twitch authorization URL
 * GET /api/twitch/auth-url
 */
exports.getAuthUrl = (req, res) => {
  try {
    const authUrl = twitchService.getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle Twitch OAuth callback
 * POST /api/twitch/callback
 */
exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const { accessToken, refreshToken, expiresIn } = await twitchService.getAccessToken(code);

    // Get user info from Twitch
    const twitchUser = await twitchService.getUserInfo(accessToken);

    // Update user's Twitch auth info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.twitchAuth = {
      twitchId: twitchUser.twitchId,
      twitchUsername: twitchUser.twitchUsername,
      twitchDisplayName: twitchUser.twitchDisplayName,
      accessToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    };

    // Also update profile social
    if (!user.profile.socials) {
      user.profile.socials = {};
    }
    user.profile.socials.twitch = twitchUser.twitchUsername;

    await user.save();

    res.json({
      message: 'Twitch account linked successfully',
      twitchUser: {
        twitchId: twitchUser.twitchId,
        twitchUsername: twitchUser.twitchUsername,
        twitchDisplayName: twitchUser.twitchDisplayName,
      },
    });
  } catch (error) {
    console.error('Twitch callback error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unlink Twitch account
 * DELETE /api/twitch/unlink
 */
exports.unlinkAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.twitchAuth = undefined;
    await user.save();

    res.json({ message: 'Twitch account unlinked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get live streams from platform users
 * GET /api/twitch/live-streams
 */
exports.getLiveStreams = async (req, res) => {
  try {
    // Get users with linked Twitch accounts
    const users = await User.find({
      'twitchAuth.twitchId': { $exists: true },
    }).select('username profile.avatar twitchAuth.twitchId twitchAuth.twitchUsername');

    const liveStreams = await twitchService.getLiveStreams(users);

    res.json({ streams: liveStreams });
  } catch (error) {
    console.error('Error getting live streams:', error);
    res.status(500).json({ message: error.message, streams: [] });
  }
};

/**
 * Check if current user is streaming
 * GET /api/twitch/my-stream
 */
exports.getMyStream = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.twitchAuth?.twitchId) {
      return res.json({ isStreaming: false });
    }

    const streams = await twitchService.checkStreams([user.twitchAuth.twitchId]);
    const myStream = streams.find(s => s.userId === user.twitchAuth.twitchId);

    res.json({
      isStreaming: !!myStream,
      stream: myStream || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

