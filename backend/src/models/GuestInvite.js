const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Model for guest player invites (subs) for tournaments
 * Allows teams to invite players who are not part of their team to play in a specific tournament
 */
const guestInviteSchema = new Schema({
  // Tournament and team
  tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  
  // Guest player being invited
  guestPlayer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Invitation details
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Captain
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'expired'], 
    default: 'pending' 
  },
  
  // Optional: player being replaced
  replacingPlayer: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Role for this tournament
  role: String,  // DPS, Tank, Support, Flex
  
  // Expiration date (e.g., 7 days after invitation)
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  
  // Timestamps
  invitedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  
  // Message from captain
  message: String,
});

// Index for faster lookups
guestInviteSchema.index({ tournament: 1, team: 1, guestPlayer: 1 });
guestInviteSchema.index({ guestPlayer: 1, status: 1 });
guestInviteSchema.index({ expiresAt: 1 });

// Method to check if invite is expired
guestInviteSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to clean up expired invites
guestInviteSchema.statics.cleanupExpired = async function() {
  await this.updateMany(
    { 
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('GuestInvite', guestInviteSchema);



