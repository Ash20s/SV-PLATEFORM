const User = require('../models/User');
const Team = require('../models/Team');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('teamId', 'name tag logo primaryColor secondaryColor');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update own profile
exports.updateProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    
    // Récupérer l'utilisateur actuel pour fusionner les préférences
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updateData = {};
    
    // Fusionner le profil si fourni
    if (profile) {
      updateData.profile = { ...currentUser.profile?.toObject(), ...profile };
    }
    
    // Fusionner les préférences si fournies
    if (preferences) {
      const currentPrefs = currentUser.preferences?.toObject() || {};
      updateData.preferences = {
        ...currentPrefs,
        ...preferences,
        // Fusionner les sous-objets (notifications, privacy)
        notifications: preferences.notifications 
          ? { ...currentPrefs.notifications, ...preferences.notifications }
          : currentPrefs.notifications,
        privacy: preferences.privacy
          ? { ...currentPrefs.privacy, ...preferences.privacy }
          : currentPrefs.privacy,
      };
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }
    
    // Construire l'URL du fichier uploadé
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatarUrl },
      { new: true }
    ).select('-password');
    
    res.json({ avatar: user.profile.avatar, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }
    
    // Construire l'URL du fichier uploadé
    const bannerUrl = `/uploads/banners/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.banner': bannerUrl },
      { new: true }
    ).select('-password');
    
    res.json({ banner: user.profile.banner, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update team profile (captain only)
exports.updateTeamProfile = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Vérifier que l'utilisateur est le captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can update profile' });
    }
    
    const { logo, banner, primaryColor, secondaryColor, description, socials, lookingForPlayers, requiredRoles } = req.body;
    
    const updateData = {};
    if (logo !== undefined) updateData.logo = logo;
    if (banner !== undefined) updateData.banner = banner;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (secondaryColor) updateData.secondaryColor = secondaryColor;
    if (description !== undefined) updateData.description = description;
    if (socials) updateData.socials = socials;
    if (lookingForPlayers !== undefined) updateData.lookingForPlayers = lookingForPlayers;
    if (requiredRoles) updateData.requiredRoles = requiredRoles;
    
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.teamId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('captain roster.player');
    
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get team profile
exports.getTeamProfile = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('captain', 'username profile.avatar')
      .populate('roster.player', 'username profile.avatar');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload team logo
exports.uploadTeamLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }
    
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }
    
    // Vérifier que l'utilisateur est le capitaine
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le capitaine peut modifier le logo' });
    }
    
    // Construire l'URL du fichier uploadé
    const logoUrl = `/uploads/teams/${req.file.filename}`;
    
    team.logo = logoUrl;
    await team.save();
    
    res.json({ logo: team.logo, team });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload team banner
exports.uploadTeamBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }
    
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }
    
    // Vérifier que l'utilisateur est le capitaine
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le capitaine peut modifier la bannière' });
    }
    
    // Construire l'URL du fichier uploadé
    const bannerUrl = `/uploads/teams/${req.file.filename}`;
    
    team.banner = bannerUrl;
    await team.save();
    
    res.json({ banner: team.banner, team });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = exports;
