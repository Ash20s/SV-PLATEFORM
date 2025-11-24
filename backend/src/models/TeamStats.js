const mongoose = require('mongoose');
const { Schema } = mongoose;

const teamStatsSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'season', 'alltime'], default: 'alltime' },
  
  // Battle Royale Team Stats
  gamesPlayed: { type: Number, default: 0 },
  totalKills: { type: Number, default: 0 },
  avgKillsPerGame: { type: Number, default: 0 },
  
  // Placement stats
  top1: { type: Number, default: 0 },  // Victories
  top3: { type: Number, default: 0 },
  top5: { type: Number, default: 0 },
  top10: { type: Number, default: 0 },
  avgPlacement: { type: Number, default: 0 },
  
  // Points & Ranking (for tournaments)
  totalPoints: { type: Number, default: 0 },  // Kill points + Placement points
  elo: { type: Number, default: 1500 },
  rank: { type: Number, default: 0 },  // Global ranking
  
  // Calculated stats
  winrate: { type: Number, default: 0 },  // top1 / gamesPlayed * 100
  top3Rate: { type: Number, default: 0 },
  
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TeamStats', teamStatsSchema);
