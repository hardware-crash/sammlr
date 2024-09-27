// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Get all transactions in collection
router.get('/', authenticateJWT, transactionController.getCollection);

// Add a transaction to collection
router.post('/', authenticateJWT, transactionController.addToCollection);

// Update a transaction in collection
router.put('/:item_id', authenticateJWT, transactionController.updateCollectionItem);

// Delete a transaction in collection
router.delete('/:item_id', authenticateJWT, transactionController.deleteCollectionItem);

// Get collection metrics
// router.get('/metrics', authenticateJWT, transactionController.getCollectionMetrics);

module.exports = router;
