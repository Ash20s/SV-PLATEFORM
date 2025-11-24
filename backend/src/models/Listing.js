const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['LFT', 'LFP'], required: true },
  title: { type: String, required: true },
  description: String,
  requirements: String,
  roles: [String],
  region: { type: String, enum: ['EU', 'NA', 'ASIA', 'OCE'] },
  availability: String,
  contact: {
    discord: { type: String, required: true },
    twitter: String,
    email: String,
  },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

listingSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
