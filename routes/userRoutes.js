const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get current user
router.get('/me', authMiddleware, userController.getCurrentUser);

// Update user
router.put('/me', authMiddleware, userController.updateUser);

// Delete user
router.delete('/me', authMiddleware, userController.deleteUser);

module.exports = router;
