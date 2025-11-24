// Hero/Legend model for Supervive
const mongoose = require('mongoose');
const { Schema } = mongoose;

const heroSchema = new Schema({
  name: { type: String, required: true, unique: true },
  displayName: String,
  role: { type: String, enum: ['DPS', 'Tank', 'Support', 'Utility'], required: true },
  description: String,
  abilities: [{
    name: String,
    description: String,
    cooldown: Number,
  }],
  icon: String,
  splash: String,
  
  // Stats from Supervive API (when available)
  stats: {
    health: Number,
    armor: Number,
    speed: Number,
  },
  
  // Meta info
  tier: { type: String, enum: ['S', 'A', 'B', 'C', 'D'] },
  pickRate: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Hero', heroSchema);
