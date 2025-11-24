const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Mapping entre les TeamID de Supervive (qui changent à chaque match)
 * et nos TeamID stables dans la DB
 */
const teamMappingSchema = new Schema({
  // ID de l'équipe Supervive dans un match spécifique
  superviveTeamId: {
    type: String,
    required: true,
    index: true
  },
  
  // ID de notre équipe dans la DB
  ourTeamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  
  // ID du match où ce mapping a été créé
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  
  // Liste des player IDs Supervive dans cette équipe
  supervivePlayerIds: [{
    type: String,
    required: true
  }],
  
  // Placement de l'équipe dans ce match
  placement: {
    type: Number,
    required: true
  },
  
  // Date du match
  matchDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // Confiance du mapping (0-1)
  // Plus il y a de joueurs correspondants, plus c'est fiable
  confidence: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1
  }
}, {
  timestamps: true
});

// Index composé pour recherche rapide
teamMappingSchema.index({ superviveTeamId: 1, matchDate: -1 });
teamMappingSchema.index({ ourTeamId: 1, matchDate: -1 });

/**
 * Trouve le mapping le plus récent pour un superviveTeamId
 */
teamMappingSchema.statics.findLatestMapping = async function(superviveTeamId, matchDate) {
  return this.findOne({
    superviveTeamId,
    matchDate: { $lte: matchDate }
  })
    .sort({ matchDate: -1 })
    .populate('ourTeamId', 'name tag logo');
};

/**
 * Trouve tous les mappings pour une équipe
 */
teamMappingSchema.statics.findTeamMappings = async function(ourTeamId, limit = 10) {
  return this.find({ ourTeamId })
    .sort({ matchDate: -1 })
    .limit(limit)
    .populate('matchId');
};

module.exports = mongoose.model('TeamMapping', teamMappingSchema);

