const mongoose = require('mongoose');

// Stats individuelles d'un joueur dans un match
const playerMatchStatsSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // KDA
  kills: { type: Number, default: 0, min: 0 },
  deaths: { type: Number, default: 0, min: 0 },
  assists: { type: Number, default: 0, min: 0 },
  
  // Revives
  revives: { type: Number, default: 0, min: 0 },        // Nombre de revives effectués
  revived: { type: Number, default: 0, min: 0 },        // Nombre de fois revivé
  
  // Damage
  damageDealt: { type: Number, default: 0, min: 0 },
  damageTaken: { type: Number, default: 0, min: 0 },
  
  // Healing
  healing: { type: Number, default: 0, min: 0 },
  
  // Position finale (1-40 pour Supervive battle royale)
  finalPosition: {
    type: Number,
    required: true,
    min: 1,
    max: 40
  },
  
  // Hunter joué
  hunter: { type: String, required: true },
  
  // Temps de survie (secondes)
  survivalTime: { type: Number, default: 0, min: 0 }
});

// Schema principal du match
const matchSchema = new mongoose.Schema({
  // ID du match provenant de l'API Supervise
  gameMatchId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Type de match
  matchType: {
    type: String,
    enum: ['ranked', 'casual', 'tournament', 'scrim', 'custom'],
    required: true
  },
  
  // Liens avec tournois/scrims
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
  scrim: { type: mongoose.Schema.Types.ObjectId, ref: 'Scrim', default: null },
  
  // Timestamps
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  duration: { type: Number, required: true }, // secondes
  
  // Stats de tous les joueurs
  playerStats: [playerMatchStatsSchema],
  
  // Map et mode
  map: { type: String, default: 'default' },
  gameMode: { type: String, default: 'battle_royale' },
  totalPlayers: { type: Number, default: 40 },
  
  // Données brutes de l'API (backup)
  rawData: { type: mongoose.Schema.Types.Mixed, default: null },
  
  // Statut de synchronisation
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'error'],
    default: 'pending'
  },
  syncError: { type: String, default: null }
}, {
  timestamps: true
});

// Index pour recherches rapides
matchSchema.index({ matchType: 1, startedAt: -1 });
matchSchema.index({ tournament: 1, startedAt: -1 });
matchSchema.index({ 'playerStats.player': 1, startedAt: -1 });
matchSchema.index({ syncStatus: 1 });

// Méthode pour calculer KDA
playerMatchStatsSchema.methods.calculateKDA = function() {
  const deaths = this.deaths === 0 ? 1 : this.deaths;
  return ((this.kills + this.assists) / deaths).toFixed(2);
};

// Stats agrégées d'un joueur
matchSchema.statics.getPlayerStats = async function(playerId) {
  return this.aggregate([
    { $unwind: '$playerStats' },
    { $match: { 'playerStats.player': mongoose.Types.ObjectId(playerId) } },
    {
      $group: {
        _id: '$playerStats.player',
        matchesPlayed: { $sum: 1 },
        totalKills: { $sum: '$playerStats.kills' },
        totalDeaths: { $sum: '$playerStats.deaths' },
        totalAssists: { $sum: '$playerStats.assists' },
        totalRevives: { $sum: '$playerStats.revives' },
        totalDamageDealt: { $sum: '$playerStats.damageDealt' },
        totalDamageTaken: { $sum: '$playerStats.damageTaken' },
        totalHealing: { $sum: '$playerStats.healing' },
        avgPosition: { $avg: '$playerStats.finalPosition' },
        bestPosition: { $min: '$playerStats.finalPosition' },
        top5Finishes: {
          $sum: { $cond: [{ $lte: ['$playerStats.finalPosition', 5] }, 1, 0] }
        },
        top10Finishes: {
          $sum: { $cond: [{ $lte: ['$playerStats.finalPosition', 10] }, 1, 0] }
        }
      }
    }
  ]);
};

// Top joueurs par kills
matchSchema.statics.getTopPlayersByKills = async function(limit = 10) {
  return this.aggregate([
    { $unwind: '$playerStats' },
    {
      $group: {
        _id: '$playerStats.player',
        totalKills: { $sum: '$playerStats.kills' },
        totalDeaths: { $sum: '$playerStats.deaths' },
        totalAssists: { $sum: '$playerStats.assists' },
        matchesPlayed: { $sum: 1 },
        avgPosition: { $avg: '$playerStats.finalPosition' }
      }
    },
    { $sort: { totalKills: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'player'
      }
    },
    { $unwind: '$player' }
  ]);
};

// Stats par hunter
matchSchema.statics.getHunterStats = async function(hunterName) {
  return this.aggregate([
    { $unwind: '$playerStats' },
    { $match: { 'playerStats.hunter': hunterName } },
    {
      $group: {
        _id: '$playerStats.hunter',
        timesPlayed: { $sum: 1 },
        avgKills: { $avg: '$playerStats.kills' },
        avgDeaths: { $avg: '$playerStats.deaths' },
        avgPosition: { $avg: '$playerStats.finalPosition' },
        avgDamage: { $avg: '$playerStats.damageDealt' },
        avgHealing: { $avg: '$playerStats.healing' },
        wins: {
          $sum: { $cond: [{ $eq: ['$playerStats.finalPosition', 1] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Match', matchSchema);
