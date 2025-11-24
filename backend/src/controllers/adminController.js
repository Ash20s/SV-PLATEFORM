const User = require('../models/User');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');

// Get admin statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const totalTeams = await Team.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ 
      status: { $in: ['registration', 'ongoing'] } 
    });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');

    res.json({
      totalUsers,
      pendingReports,
      totalTeams,
      activeTournaments,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports with filters
exports.getReports = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const reports = await Report.find(filter)
      .populate('reporter', 'username')
      .populate('reported', 'username')
      .populate('resolution.resolvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve a report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolution: {
          action,
          notes,
          resolvedBy: req.user._id,
          resolvedAt: new Date()
        }
      },
      { new: true }
    ).populate('reporter reported', 'username');

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a report
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        resolution: {
          action: 'no_action',
          notes,
          resolvedBy: req.user._id,
          resolvedAt: new Date()
        }
      },
      { new: true }
    ).populate('reporter reported', 'username');

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with search and filters
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ban/unban user
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        status: banned ? 'banned' : 'active',
        banReason: reason 
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, priority } = req.body;

    const announcement = new Announcement({
      title,
      content,
      type,
      priority
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
