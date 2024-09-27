// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Define the search route
router.get('/', searchController.searchGames);

module.exports = router;