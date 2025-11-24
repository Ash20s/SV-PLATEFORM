const Listing = require('../models/Listing');

/**
 * Get all listings with filters
 * GET /api/listings
 */
exports.getListings = async (req, res) => {
  try {
    const { type, region, role, status = 'active', limit = 20, page = 1 } = req.query;

    const query = { status };
    if (type) query.type = type;
    if (region) query.region = region;
    if (role) query.roles = role;

    // Only show active listings that haven't expired
    query.expiresAt = { $gte: new Date() };

    const listings = await Listing.find(query)
      .populate('author', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
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
 * Get single listing by ID
 * GET /api/listings/:id
 */
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('author', 'username profile teamId');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new listing (LFT/LFP)
 * POST /api/listings
 */
exports.createListing = async (req, res) => {
  try {
    const {
      type,
      role,
      description,
      experience,
      region,
      availability,
      languages,
      contact,
    } = req.body;

    // Generate title based on type and role
    const title = type === 'LFT' 
      ? `${role} player looking for team`
      : `Team looking for ${role}`;

    // Prepare contact object
    const contactObj = typeof contact === 'string' 
      ? { discord: contact }
      : contact;

    // Prepare roles array
    const rolesArray = Array.isArray(role) ? role : [role];

    const listing = await Listing.create({
      author: req.user.id,
      type: type.toUpperCase(), // Ensure uppercase (LFT/LFP)
      title,
      description,
      requirements: experience || '',
      roles: rolesArray,
      region,
      availability,
      contact: contactObj,
    });

    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update listing
 * PUT /api/listings/:id
 */
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is author
    if (listing.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can update listing' });
    }

    const {
      title,
      description,
      requirements,
      roles,
      region,
      availability,
      contact,
    } = req.body;

    Object.assign(listing, {
      title,
      description,
      requirements,
      roles,
      region,
      availability,
      contact,
    });

    await listing.save();

    res.json({ message: 'Listing updated successfully', listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is author
    if (listing.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can delete listing' });
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Close listing (mark as closed)
 * PATCH /api/listings/:id/close
 */
exports.closeListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is author
    if (listing.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can close listing' });
    }

    listing.status = 'closed';
    await listing.save();

    res.json({ message: 'Listing closed successfully', listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
