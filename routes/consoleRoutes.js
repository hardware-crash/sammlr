// routes/consoleRoutes.js

const express = require('express');
const router = express.Router();
const consoleController = require('../controllers/consoleController');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads if needed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Get all games for a console
router.get('/:console_name', consoleController.getGamesByConsoleName);

module.exports = router;
