const mongoose = require('mongoose');
const { Schema } = mongoose;

const scrimSchema = new Schema({
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: Schema.Types.ObjectId, ref: 'Team' }, // Deprecated - kept for backward compatibility
  opponent: { type: Schema.Types.ObjectId, ref: 'Team' },
  
  // Competitive tier
  tier: { 
    type: String, 
    enum: ['Tier 1', 'Tier 2', 'Both'], 
    default: 'Both' 
  },
  
  // Battle Royale: multiple teams can join (lobby)
  participants: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    status: { type: String, enum: ['invited', 'confirmed', 'declined'], default: 'invited' },
  }],
  
  date: { type: Date, required: true },
  time: String,
  status: { type: String, enum: ['pending', 'open', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  server: String,
  region: { type: String, enum: ['EU', 'NA', 'ASIA', 'OCE', 'SA'] },
  
  // Game mode: Trio (3 players) or Squad (4 players)
  gameMode: { 
    type: String, 
    enum: ['Trio', 'Squad'], 
    default: 'Squad' 
  },
  
  // Battle Royale format
  numberOfGames: { type: Number, default: 1 },  // How many BR games/lobbies
  maxTeams: { type: Number, default: 10 },  // Maximum teams per lobby/game (12 for Trio, 10 for Squad)
  
  // Visual assets
  bannerImage: { type: String, default: '' }, // URL de l'image de fond
  
  // Results (one per game)
  games: [{
    gameNumber: Number,
    results: [{
      team: { type: Schema.Types.ObjectId, ref: 'Team' },
      placement: Number,
      kills: Number,
      points: Number,
    }],
    mapName: String,
    vodLink: String,
  }],
  
  // Overall results
  finalStandings: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    totalPoints: Number,
    totalKills: Number,
    avgPlacement: Number,
  }],
  
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Scrim', scrimSchema);
