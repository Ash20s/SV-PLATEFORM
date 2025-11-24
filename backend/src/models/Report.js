const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['toxicity', 'dispute', 'bug', 'other'],
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reported: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['tournament', 'scrim', 'team', 'user', 'other']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  reason: {
    type: String,
    required: true
  },
  evidence: {
    type: String // Screenshots, logs, etc.
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  resolution: {
    action: String, // 'ban', 'warning', 'no_action', etc.
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
