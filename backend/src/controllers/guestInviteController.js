const GuestInvite = require('../models/GuestInvite');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

/**
 * Get pending invites for a user
 * GET /api/guest-invites/pending
 */
exports.getPendingInvites = async (req, res) => {
  try {
    const invites = await GuestInvite.find({
      guestPlayer: req.user.id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('tournament', 'name startDate gameMode')
      .populate('team', 'name tag logo')
      .populate('invitedBy', 'username profile')
      .populate('replacingPlayer', 'username')
      .sort({ invitedAt: -1 });

    res.json({ invites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Accept a guest invite
 * POST /api/guest-invites/:id/accept
 */
exports.acceptInvite = async (req, res) => {
  try {
    const invite = await GuestInvite.findById(req.params.id)
      .populate('tournament')
      .populate('team');

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // Check if invite is for this user
    if (invite.guestPlayer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'This invite is not for you' });
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invite is already ${invite.status}` });
    }

    // Check if invite is expired
    if (invite.isExpired()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    // Check if tournament is still in registration
    const tournament = invite.tournament;
    if (tournament.status !== 'registration' && tournament.status !== 'locked') {
      return res.status(400).json({ message: 'Tournament registration is closed' });
    }

    // Find the registration for this team
    const registration = tournament.registeredTeams.find(
      rt => rt.team.toString() === invite.team._id.toString()
    );

    if (!registration) {
      return res.status(404).json({ message: 'Team is not registered for this tournament' });
    }

    // Update invite status
    invite.status = 'accepted';
    invite.respondedAt = new Date();
    await invite.save();

    // Update guest player in registration
    const guestPlayerEntry = registration.guestPlayers.find(
      gp => gp.player.toString() === invite.guestPlayer.toString()
    );

    if (guestPlayerEntry) {
      guestPlayerEntry.inviteStatus = 'accepted';
      guestPlayerEntry.acceptedAt = new Date();

      // Add to participating players if replacing another player or if needed
      const requiredSize = tournament.gameMode === 'Trio' ? 3 : 4;
      const currentParticipants = registration.participatingPlayers?.length || 0;

      if (currentParticipants < requiredSize || invite.replacingPlayer) {
        // Add guest player to participating players
        if (!registration.participatingPlayers) {
          registration.participatingPlayers = [];
        }

        // If replacing a player, remove them first
        if (invite.replacingPlayer) {
          registration.participatingPlayers = registration.participatingPlayers.filter(
            pp => pp.player.toString() !== invite.replacingPlayer.toString()
          );
        }

        // Add guest player
        registration.participatingPlayers.push({
          player: invite.guestPlayer,
          isGuest: true,
          isMainRoster: false,
          role: invite.role,
          guestInviteId: invite._id,
        });
      }
    }

    await tournament.save();

    res.json({ 
      message: 'Invite accepted successfully',
      invite,
      tournament: {
        id: tournament._id,
        name: tournament.name,
        status: tournament.status,
      },
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reject a guest invite
 * POST /api/guest-invites/:id/reject
 */
exports.rejectInvite = async (req, res) => {
  try {
    const invite = await GuestInvite.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // Check if invite is for this user
    if (invite.guestPlayer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'This invite is not for you' });
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invite is already ${invite.status}` });
    }

    // Update invite status
    invite.status = 'rejected';
    invite.respondedAt = new Date();
    await invite.save();

    // Update guest player in tournament registration if exists
    const tournament = await Tournament.findById(invite.tournament);
    if (tournament) {
      const registration = tournament.registeredTeams.find(
        rt => rt.team.toString() === invite.team.toString()
      );

      if (registration) {
        const guestPlayerEntry = registration.guestPlayers.find(
          gp => gp.player.toString() === invite.guestPlayer.toString()
        );

        if (guestPlayerEntry) {
          guestPlayerEntry.inviteStatus = 'rejected';
        }

        await tournament.save();
      }
    }

    res.json({ message: 'Invite rejected successfully', invite });
  } catch (error) {
    console.error('Reject invite error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Invite a guest player to tournament (Captain only)
 * POST /api/tournaments/:id/invite-guest
 * Body: { playerId, role, replacingPlayer?, message? }
 */
exports.inviteGuestPlayer = async (req, res) => {
  try {
    const { playerId, role, replacingPlayer, message } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Can only invite guests during registration period' });
    }

    // Get user's team
    const user = await User.findById(req.user.id);
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    const Team = require('../models/Team');
    const team = await Team.findById(user.teamId)
      .populate('captain', 'username')
      .populate('roster.player', 'username');

    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can invite guest players' });
    }

    // Check if team is registered
    const registration = tournament.registeredTeams.find(
      rt => rt.team.toString() === team._id.toString()
    );

    if (!registration) {
      return res.status(400).json({ message: 'Team must be registered first before inviting guests' });
    }

    // Check if guest player exists
    const guestUser = await User.findById(playerId);
    if (!guestUser) {
      return res.status(404).json({ message: 'Guest player not found' });
    }

    // Check if guest player is already in the team
    const allTeamPlayers = [team.captain._id, ...(team.roster?.map(r => r.player._id || r.player) || [])];
    const isTeamPlayer = allTeamPlayers.some(tp => tp.toString() === playerId.toString());
    if (isTeamPlayer) {
      return res.status(400).json({ message: 'Player is already part of your team' });
    }

    // Check if invite already exists
    const existingInvite = await GuestInvite.findOne({
      tournament: tournament._id,
      team: team._id,
      guestPlayer: playerId,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'An invite for this player already exists' });
    }

    // Create invite
    const invite = await GuestInvite.create({
      tournament: tournament._id,
      team: team._id,
      guestPlayer: playerId,
      invitedBy: req.user.id,
      role: role || 'Flex',
      replacingPlayer: replacingPlayer || null,
      message: message || null,
      status: 'pending',
    });

    // Add to guest players in registration
    if (!registration.guestPlayers) {
      registration.guestPlayers = [];
    }

    registration.guestPlayers.push({
      player: playerId,
      inviteStatus: 'pending',
      invitedAt: new Date(),
      invitedBy: req.user.id,
      role: role || 'Flex',
      replacingPlayer: replacingPlayer || null,
    });

    await tournament.save();

    res.json({ 
      message: 'Guest player invited successfully',
      invite: {
        id: invite._id,
        guestPlayer: invite.guestPlayer,
        status: invite.status,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invite guest player error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel a guest invite (Captain only)
 * DELETE /api/guest-invites/:id
 */
exports.cancelInvite = async (req, res) => {
  try {
    const invite = await GuestInvite.findById(req.params.id)
      .populate('team')
      .populate('tournament');

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // Check if user is captain of the team
    const user = await User.findById(req.user.id);
    if (!user || !user.teamId) {
      return res.status(400).json({ message: 'You must be part of a team' });
    }

    if (invite.team.captain.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captains can cancel invites' });
    }

    // Can only cancel pending invites
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel an invite that is ${invite.status}` });
    }

    // Update invite status
    invite.status = 'expired';
    invite.respondedAt = new Date();
    await invite.save();

    // Remove from tournament registration guest players
    const tournament = invite.tournament;
    if (tournament) {
      const registration = tournament.registeredTeams.find(
        rt => rt.team.toString() === invite.team._id.toString()
      );

      if (registration && registration.guestPlayers) {
        registration.guestPlayers = registration.guestPlayers.filter(
          gp => gp.player.toString() !== invite.guestPlayer.toString()
        );

        // Also remove from participating players if added
        if (registration.participatingPlayers) {
          registration.participatingPlayers = registration.participatingPlayers.filter(
            pp => !pp.isGuest || pp.player.toString() !== invite.guestPlayer.toString()
          );
        }

        await tournament.save();
      }
    }

    res.json({ message: 'Invite cancelled successfully', invite });
  } catch (error) {
    console.error('Cancel invite error:', error);
    res.status(500).json({ message: error.message });
  }
};



