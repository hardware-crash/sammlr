// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const cookieParser = require('cookie-parser');

// Use cookie-parser middleware to parse cookies
router.use(cookieParser());

// Registration Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

// Refresh Token Route
router.post('/refresh', authController.refresh);

// Logout Route
router.post('/logout', authenticateJWT, authController.logout);

module.exports = router;
