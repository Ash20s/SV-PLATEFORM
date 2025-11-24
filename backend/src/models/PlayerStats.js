const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerStatsSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'season', 'alltime'], default: 'alltime' },
  
  // Battle Royale specific stats
  gamesPlayed: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  knockdowns: { type: Number, default: 0 },
  revives: { type: Number, default: 0 },
  
  // Damage stats
  totalDamage: { type: Number, default: 0 },
  avgDamage: { type: Number, default: 0 },
  maxDamageInGame: { type: Number, default: 0 },
  
  // Placement stats (Battle Royale)
  top1: { type: Number, default: 0 },  // Victories
  top3: { type: Number, default: 0 },
  top5: { type: Number, default: 0 },
  top10: { type: Number, default: 0 },
  avgPlacement: { type: Number, default: 0 },
  
  // Calculated stats
  kda: { type: Number, default: 0 },  // (Kills + Assists) / Deaths
  killsPerGame: { type: Number, default: 0 },
  winrate: { type: Number, default: 0 },  // top1 / gamesPlayed * 100
  
  // Hero/Legend stats
  mostPlayedHero: String,
  heroStats: [{
    heroName: String,
    gamesPlayed: Number,
    kills: Number,
    wins: Number,
    avgPlacement: Number,
  }],
  
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlayerStats', playerStatsSchema);
