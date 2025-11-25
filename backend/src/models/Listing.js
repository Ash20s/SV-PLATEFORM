const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Listing Model - Pour les annonces LFT (Looking For Team) et LFP (Looking For Players)
 */
const listingSchema = new Schema({
  // Type d'annonce
  type: {
    type: String,
    enum: ['LFT', 'LFP'], // Looking For Team ou Looking For Players
    required: true
  },
  
  // Auteur de l'annonce
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Pour LFP: équipe qui cherche des joueurs
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Titre de l'annonce
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Description détaillée
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Tier recherché
  tier: {
    type: String,
    enum: ['Tier 1', 'Tier 2', 'Both', 'Any'],
    default: 'Any'
  },
  
  // Région
  region: {
    type: String,
    enum: ['EU', 'NA', 'AS', 'OCE', 'SA', 'Any'],
    default: 'Any'
  },
  
  // Rôles recherchés (pour LFP) ou rôles du joueur (pour LFT)
  roles: [{
    type: String,
    enum: ['Hunter', 'Flex', 'Support', 'Tank', 'DPS', 'Any']
  }],
  
  // Disponibilités
  availability: {
    type: String,
    maxlength: 200
  },
  
  // Infos de contact (Discord, etc.)
  contact: {
    discord: String,
    twitter: String,
    other: String
  },
  
  // Statut de l'annonce
  status: {
    type: String,
    enum: ['active', 'closed', 'expired'],
    default: 'active'
  },
  
  // Stats du joueur (pour LFT)
  playerStats: {
    mmr: Number,
    rank: String,
    experience: String // "Beginner", "Intermediate", "Advanced", "Pro"
  },
  
  // Nombre de joueurs recherchés (pour LFP)
  playersNeeded: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
  },
  
  // Vues
  views: {
    type: Number,
    default: 0
  },
  
  // Réponses/Intérêt
  responses: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Date d'expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
  }
}, {
  timestamps: true
});

// Index pour les recherches
listingSchema.index({ type: 1, status: 1 });
listingSchema.index({ tier: 1, region: 1 });
listingSchema.index({ author: 1 });
listingSchema.index({ team: 1 });
listingSchema.index({ expiresAt: 1 });

// Middleware pour marquer comme expiré automatiquement
listingSchema.pre('find', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

listingSchema.pre('findOne', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

// Méthode pour incrémenter les vues
listingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Méthode pour ajouter une réponse
listingSchema.methods.addResponse = function(userId, message) {
  this.responses.push({ user: userId, message });
  return this.save();
};

// Méthode pour clôturer l'annonce
listingSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

module.exports = mongoose.model('Listing', listingSchema);
