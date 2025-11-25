const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'player', 'captain', 'organizer', 'admin'], default: 'viewer' },
  profile: {
    avatar: { type: String, default: '' }, // URL de l'avatar
    banner: { type: String, default: '' }, // URL de la bannière profile
    bio: { type: String, default: '', maxlength: 500 },
    country: String,
    pronouns: String, // he/him, she/her, they/them
    favoriteHunter: String, // Personnage favori Supervise
    socials: {
      twitter: String,
      discord: String,
      twitch: String,
      youtube: String,
    },
  },
  // Twitch OAuth integration
  twitchAuth: {
    twitchId: { type: String, unique: true, sparse: true },
    twitchUsername: String,
    twitchDisplayName: String,
    accessToken: String,
    refreshToken: String,
    tokenExpiresAt: Date,
    isStreaming: { type: Boolean, default: false },
    lastStreamCheck: Date,
  },
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      teamInvites: { type: Boolean, default: true },
      tournamentUpdates: { type: Boolean, default: true },
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'hidden'], default: 'public' },
      showEmail: { type: Boolean, default: false },
      showStats: { type: Boolean, default: true },
      allowTeamInvites: { type: Boolean, default: true },
    },
  },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  isBanned: { type: Boolean, default: false },
  bannedUntil: Date,
  banReason: String,
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
