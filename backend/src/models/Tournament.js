const mongoose = require('mongoose');
const { Schema } = mongoose;

const tournamentSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  
  // Competitive tier
  tier: { 
    type: String, 
    enum: ['Tier 1', 'Tier 2', 'Both'], 
    default: 'Both' 
  },
  
  region: { 
    type: String, 
    enum: ['EU', 'NA', 'ASIA', 'OCE'] 
  },
  
  // Battle Royale tournament format
  format: { 
    type: String, 
    enum: ['points-based', 'single-elimination', 'double-elimination'], 
    default: 'points-based' 
  },
  
  // Game mode: Trio (3 players) or Squad (4 players)
  gameMode: { 
    type: String, 
    enum: ['Trio', 'Squad'], 
    default: 'Squad' 
  },
  
  // Points system for BR (Supervive official format)
  pointsSystem: {
    placementPoints: {
      type: Map,
      of: Number,
      default: {
        1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
        7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
      }
    },
    killPoints: { type: Number, default: 1 },  // Points per kill
  },
  
  maxTeams: { type: Number, default: 10 },  // Maximum teams per lobby/game (12 for Trio, 10 for Squad)
  numberOfGames: { type: Number, default: 6 },  // Total games/lobbies in tournament
  prizePool: Number,
  
  // Visual assets
  bannerImage: { type: String, default: '' }, // URL de l'image de fond
  thumbnail: { type: String, default: '' }, // URL de la miniature
  
  // Prize distribution (percentage for each placement)
  prizeDistribution: [{
    placement: Number,  // 1st, 2nd, 3rd, etc.
    percentage: Number,  // % of prize pool
  }],
  
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['upcoming', 'registration', 'locked', 'ongoing', 'completed'], default: 'upcoming' },
  
  // Scoreboard published games (controlled by organizer)
  publishedGames: [{ type: Number }],  // Array of game numbers that are published/visible in scoreboard
  // Example: [1, 2, 3] means only games 1, 2, and 3 are visible in scoreboard
  
  // Official rules
  rules: { 
    type: String, 
    default: `Rules:

No out of game communication related to in game plans.

Any instances of teaming are up to be reviewed and punished by TOs at any time.

Play with competitive integrity and fair-play.

Discord rules still apply during the tourney.

No Below/Above ground level basecamp.

No Skywards.

No space Beebo's ult (above jumppad height).

No intentional below ground level Wukong's slam.

No Wukong double slam.

No "grapply" tech (grappling to get higher than jumppad height).

No Beebo fast car.

No double LMB keybind / No "macro" keybind.

No intentional bug abuse. Bug abuse will be punished at admins/hosts discretion.

No hiding your own name.

No spamming lobby chat.

Teams are expected to be in the lobby 15 minutes before the first game starts.

No name changing after signing up for the event until the event is over.

No abusing any XP related exploits.

All Teams are required to use Tournament Discord VC Channels during events.

No open toxicity in any official broadcasts or public chat channels.

No stream sniping.

1 minute stream delay required for every streamer of the event.

No joining other teams channels during the event.

If you are banned from the discord you cannot play in the event.

Banned Skins:

God Of Time Void

Hyperion Ghost

Consequences of Breaking a Rule:

Any breaking of rules will be handled at our discretion in whatever way we see fit.

Punishments can include anything from Loss of points, Loss of Prizepool, Full Disqualification and Bans from future events.

What to do if you see another Team Breaking Rules:

Record a clip of the team breaking the rule using Medal, Twitch clips, Nvidia Shadowplay or any clipping software.

Contact an admin, explain what rule they broke and provide the clip.`
  },
  
  // Qualification system
  hasQualifiers: { type: Boolean, default: false },
  qualifierSettings: {
    numberOfGroups: { type: Number, default: 2 },  // Nombre de groupes (A, B, C...)
    teamsPerGroup: Number,  // Nombre d'équipes par groupe
    qualifiersPerGroup: { type: Number, default: 8 },  // Top X se qualifient
    gamesPerGroup: { type: Number, default: 3 },  // Nombre de games en qualif
    transferNonQualified: { type: Boolean, default: false },  // Transfer non-qualified teams to next group
  },
  
  // Groups for qualifiers
  qualifierGroups: [{
    groupName: String,  // "Group A", "Group B", etc.
    groupOrder: Number,  // Order of group (1 = first, 2 = second, etc.)
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    games: [{
      gameNumber: Number,
      date: Date,
      status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'scheduled' },
      results: [{
        team: { type: Schema.Types.ObjectId, ref: 'Team' },
        placement: Number,
        kills: Number,
        placementPoints: Number,
        killPoints: Number,
        totalPoints: Number,
      }],
    }],
    standings: [{
      team: { type: Schema.Types.ObjectId, ref: 'Team' },
      totalPoints: Number,
      totalKills: Number,
      avgPlacement: Number,
      gamesPlayed: Number,
      qualified: { type: Boolean, default: false },
    }],
    checkInSettings: {
      opensAt: Date,
      closesAt: Date,
      lobbyOpensAt: Date,  // When teams need to be in lobby
      gameStartsAt: Date,  // When game starts
    },
  }],
  
  // Teams qualified for finals
  qualifiedTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  
  // Check-in system
  checkInSettings: {
    enabled: { type: Boolean, default: true },
    opensAt: Date,  // When check-in opens (e.g., 2 hours before tournament)
    closesAt: Date,  // When check-in closes (e.g., 30 min before tournament)
  },
  
  // Registered teams (with check-in status and player selection)
  registeredTeams: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    registeredAt: { type: Date, default: Date.now },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: Date,
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },  // Captain who checked in
    
    // Players selected for this tournament
    participatingPlayers: [{
      player: { type: Schema.Types.ObjectId, ref: 'User' },
      isGuest: { type: Boolean, default: false },  // True if this is a sub/guest player
      guestInviteId: { type: Schema.Types.ObjectId, ref: 'GuestInvite' },  // If guest, link to invite
      role: String,  // DPS, Tank, Support, Flex
      isMainRoster: { type: Boolean, default: true },  // True if player is from main roster
    }],
    
    // Guest players (subs) for this tournament
    guestPlayers: [{
      player: { type: Schema.Types.ObjectId, ref: 'User' },
      inviteStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      invitedAt: { type: Date, default: Date.now },
      acceptedAt: Date,
      invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },  // Captain who invited
      role: String,  // DPS, Tank, Support, Flex
      replacingPlayer: { type: Schema.Types.ObjectId, ref: 'User' },  // Player being replaced (optional)
    }],
  }],
  
  // Waitlist (teams waiting if tournament is full)
  waitlist: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    joinedAt: { type: Date, default: Date.now },
    position: Number,  // Position in waitlist
  }],
  
  // Games (matches) played
  games: [{
    gameNumber: Number,
    date: Date,
    status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'scheduled' },
    results: [{
      team: { type: Schema.Types.ObjectId, ref: 'Team' },
      placement: Number,
      kills: Number,
      placementPoints: Number,
      killPoints: Number,
      totalPoints: Number,
    }],
    mapName: String,
    vodLink: String,
  }],
  
  // Overall standings
  standings: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    placement: Number,  // Final placement (1st, 2nd, 3rd, etc.)
    totalPoints: Number,
    totalKills: Number,
    totalPlacementPoints: Number,  // For tiebreaker
    pointsBeforeLastGame: Number,  // For tiebreaker
    avgPlacement: Number,
    wins: Number,  // Number of game victories
    gamesPlayed: Number,
    earnings: Number,  // Prize money earned
  }],
  
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Index pour optimiser les requêtes
tournamentSchema.index({ status: 1, startDate: -1 });
tournamentSchema.index({ 'qualifierGroups.teams': 1 });
tournamentSchema.index({ qualifiedTeams: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
