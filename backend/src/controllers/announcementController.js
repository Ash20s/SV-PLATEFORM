const Announcement = require('../models/Announcement');
const Team = require('../models/Team');

/**
 * Get all announcements
 * GET /api/announcements
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const { type, teamId, limit = 20, page = 1 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (teamId) query.team = teamId;

    const announcements = await Announcement.find(query)
      .populate('author', 'username profile.avatar')
      .populate('team', 'name tag logo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new announcement
 * POST /api/announcements
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, teamId } = req.body;

    // Check permissions
    if (type === 'global' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create global announcements' });
    }

    if (type === 'team') {
      const team = await Team.findOne({ _id: teamId, captain: req.user.id });
      if (!team) {
        return res.status(403).json({ message: 'Only team captain can create team announcements' });
      }
    }

    const announcement = await Announcement.create({
      author: req.user.id,
      title,
      content,
      type,
      team: type === 'team' ? teamId : undefined,
    });

    res.status(201).json({ message: 'Announcement created successfully', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
