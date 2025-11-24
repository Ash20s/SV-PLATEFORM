const mongoose = require('mongoose');
const { Schema } = mongoose;

const teamSchema = new Schema({
  name: { type: String, unique: true, required: true },
  tag: { type: String, unique: true, required: true, minlength: 3, maxlength: 5 },
  
  // Personnalisation visuelle
  logo: { type: String, default: '' }, // URL du logo
  banner: { type: String, default: '' }, // URL de la bannière
  primaryColor: { type: String, default: '#00FFC6' }, // Couleur principale
  secondaryColor: { type: String, default: '#19F9A9' }, // Couleur secondaire
  
  // Info équipe
  description: { type: String, default: '', maxlength: 1000 },
  region: { type: String, enum: ['EU', 'NA', 'ASIA', 'OCE', 'SA'], required: true },
  tier: { type: String, enum: ['Tier 1', 'Tier 2', 'Amateur'], default: 'Amateur' },
  lookingForPlayers: { type: Boolean, default: false },
  requiredRoles: [String], // Rôles recherchés
  
  captain: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roster: [{
    player: { type: Schema.Types.ObjectId, ref: 'User' },
    role: String,
    joinedAt: { type: Date, default: Date.now },
  }],
  
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    elo: { type: Number, default: 1500 },
    winrate: { type: Number, default: 0 },
    tournamentsPlayed: { type: Number, default: 0 },
    tournamentsWon: { type: Number, default: 0 },
  },
  
  socials: {
    twitter: String,
    discord: String,
    website: String,
    twitch: String,
    youtube: String,
  },
  
  achievements: [{
    title: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware pour mettre à jour updatedAt
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Team', teamSchema);
