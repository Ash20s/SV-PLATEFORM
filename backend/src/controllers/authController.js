const User = require('../models/User');
const Team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/auth');

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'viewer',
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpire }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('teamId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpire }
    );

    // Normalize teamId - can be ObjectId or populated object
    let teamId = null;
    if (user.teamId) {
      teamId = typeof user.teamId === 'object' ? user.teamId._id?.toString() || user.teamId._id : user.teamId.toString();
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: teamId,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('teamId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Normalize teamId - can be ObjectId or populated object
    let teamId = null;
    if (user.teamId) {
      teamId = typeof user.teamId === 'object' ? user.teamId._id?.toString() || user.teamId._id : user.teamId.toString();
    }

    // Return normalized user object
    const normalizedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      teamId: teamId,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    res.json({ user: normalizedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  // With JWT, logout is handled client-side by removing token
  res.json({ message: 'Logout successful' });
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete account
 * DELETE /api/auth/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is captain of a team, handle team deletion or transfer
    if (user.teamId) {
      const team = await Team.findById(user.teamId);
      if (team && team.captain.toString() === req.user.id.toString()) {
        // If team has other members, you might want to transfer captaincy
        // For now, we'll just delete the team
        await Team.deleteOne({ _id: team._id });
        // Remove team reference from all members
        await User.updateMany(
          { teamId: team._id },
          { $unset: { teamId: '' }, role: 'player' }
        );
      } else {
        // Remove user from team roster
        await Team.updateMany(
          { 'roster.player': req.user.id },
          { $pull: { roster: { player: req.user.id } } }
        );
      }
    }

    // Delete user
    await User.deleteOne({ _id: req.user.id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};