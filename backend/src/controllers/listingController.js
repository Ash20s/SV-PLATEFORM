const Listing = require('../models/Listing');
const User = require('../models/User');
const Team = require('../models/Team');

/**
 * GET /api/listings
 * Get all listings with filters
 */
exports.getListings = async (req, res) => {
  try {
    const { type, tier, region, status = 'active' } = req.query;
    
    const query = { status };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (tier && tier !== 'Any') {
      query.tier = { $in: [tier, 'Any', 'Both'] };
    }
    
    if (region && region !== 'Any') {
      query.region = { $in: [region, 'Any'] };
    }
    
    const listings = await Listing.find(query)
      .populate('author', 'username avatar profile')
      .populate('team', 'name tag logo')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

/**
 * GET /api/listings/:id
 * Get a single listing by ID
 */
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('author', 'username avatar profile')
      .populate('team', 'name tag logo roster')
      .populate('responses.user', 'username avatar');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Incrémenter les vues
    await listing.incrementViews();
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
};

/**
 * POST /api/listings
 * Create a new listing (protected)
 */
exports.createListing = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      tier,
      region,
      roles,
      availability,
      contact,
      playerStats,
      playersNeeded,
      teamId
    } = req.body;
    
    // Validation
    if (!type || !title || !description) {
      return res.status(400).json({ message: 'Type, title and description are required' });
    }
    
    if (!['LFT', 'LFP'].includes(type)) {
      return res.status(400).json({ message: 'Type must be LFT or LFP' });
    }
    
    // Si LFP, vérifier que l'utilisateur a une équipe ou qu'un teamId est fourni
    if (type === 'LFP' && !teamId && !req.user.teamId) {
      return res.status(400).json({ message: 'LFP listings require a team' });
    }
    
    const listingData = {
      type,
      author: req.user.id,
      title,
      description,
      tier: tier || 'Any',
      region: region || 'Any',
      roles: roles || [],
      availability,
      contact,
      playerStats,
      playersNeeded
    };
    
    // Ajouter l'équipe si LFP
    if (type === 'LFP') {
      listingData.team = teamId || req.user.teamId;
    }
    
    const listing = new Listing(listingData);
    await listing.save();
    
    // Populate avant de renvoyer
    await listing.populate('author', 'username avatar profile');
    await listing.populate('team', 'name tag logo');
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
};

/**
 * PATCH /api/listings/:id
 * Update a listing (protected, author only)
 */
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (listing.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    const allowedUpdates = [
      'title',
      'description',
      'tier',
      'region',
      'roles',
      'availability',
      'contact',
      'playerStats',
      'playersNeeded',
      'status'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });
    
    await listing.save();
    await listing.populate('author', 'username avatar profile');
    await listing.populate('team', 'name tag logo');
    
    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
};

/**
 * DELETE /api/listings/:id
 * Delete a listing (protected, author only)
 */
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (listing.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    await Listing.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Error deleting listing', error: error.message });
  }
};

/**
 * POST /api/listings/:id/respond
 * Respond to a listing (protected)
 */
exports.respondToListing = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This listing is no longer active' });
    }
    
    // Ne pas permettre à l'auteur de répondre à sa propre annonce
    if (listing.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot respond to your own listing' });
    }
    
    await listing.addResponse(req.user.id, message);
    await listing.populate('responses.user', 'username avatar');
    
    res.json({ message: 'Response sent successfully', listing });
  } catch (error) {
    console.error('Error responding to listing:', error);
    res.status(500).json({ message: 'Error responding to listing', error: error.message });
  }
};

/**
 * PATCH /api/listings/:id/close
 * Close a listing (protected, author only)
 */
exports.closeListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (listing.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to close this listing' });
    }
    
    await listing.close();
    
    res.json({ message: 'Listing closed successfully', listing });
  } catch (error) {
    console.error('Error closing listing:', error);
    res.status(500).json({ message: 'Error closing listing', error: error.message });
  }
};

/**
 * GET /api/listings/my
 * Get current user's listings (protected)
 */
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ author: req.user.id })
      .populate('team', 'name tag logo')
      .sort({ createdAt: -1 });
    
    res.json({ listings });
  } catch (error) {
    console.error('Error fetching my listings:', error);
    res.status(500).json({ message: 'Error fetching your listings', error: error.message });
  }
};
