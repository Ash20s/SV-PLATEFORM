const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authenticate = require('../middlewares/auth.middleware');

// Public routes
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById);

// Protected routes
router.post('/', authenticate, listingController.createListing);
router.patch('/:id', authenticate, listingController.updateListing);
router.delete('/:id', authenticate, listingController.deleteListing);
router.post('/:id/respond', authenticate, listingController.respondToListing);
router.patch('/:id/close', authenticate, listingController.closeListing);
router.get('/my/listings', authenticate, listingController.getMyListings);

module.exports = router;

