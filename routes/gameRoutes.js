// routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const multer = require('multer');
const path = require('path');
const authenticateJWT = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Get game details by console and game name
router.get('/:console_name/:game_name', gameController.getGameDetailsByConsoleAndName);

// Get single game
router.get('/:game_id', gameController.getGame);

// Search games
router.get('/search', gameController.searchGames);

// Update game (Admin only)
router.put('/:game_id', authenticateJWT, adminMiddleware, gameController.updateGame);

// Delete game (Admin only)
router.delete('/:game_id', authenticateJWT, adminMiddleware, gameController.deleteGame);

// Upload game cover (Admin only)
router.post('/:game_id/upload-cover', authenticateJWT, adminMiddleware, upload.single('file'), gameController.uploadGameCover);

// Get game with prices
router.get('/:game_id/prices', gameController.getGameWithPrices);

module.exports = router;
