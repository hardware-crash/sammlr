// routes/wishlistRoutes.js

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authenticateJWT = require('../middlewares/authMiddleware');

// Apply authentication middleware to all wishlist routes
router.use(authenticateJWT);

// GET /api/wishlist/:game_id?
router.get('/:game_id?', wishlistController.getWishlist);

// POST /api/wishlist
router.post('/', wishlistController.addToWishlist);

// DELETE /api/wishlist
router.delete('/', wishlistController.removeFromWishlist);

module.exports = router;
