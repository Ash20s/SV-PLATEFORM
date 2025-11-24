const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nickname: { type: String, required: true },
  mainRole: String,
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  stats: { type: Schema.Types.ObjectId, ref: 'PlayerStats' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Player', playerSchema);
