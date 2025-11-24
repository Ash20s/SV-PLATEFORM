const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', listingController.getListings);
router.get('/:id', listingController.getListing);
router.post('/', authMiddleware, listingController.createListing);
router.put('/:id', authMiddleware, listingController.updateListing);
router.delete('/:id', authMiddleware, listingController.deleteListing);
router.patch('/:id/close', authMiddleware, listingController.closeListing);

module.exports = router;
