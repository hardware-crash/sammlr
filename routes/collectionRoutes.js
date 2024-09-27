// routes/collectionRoutes.js

const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticateJWT = require('../middlewares/authMiddleware'); // JWT authentication middleware

// Apply authentication middleware to all routes in this router
router.use(authenticateJWT);

// GET /api/collection
router.get('/', collectionController.getItemsInCollection);

// POST /api/collection
router.post('/', collectionController.addToCollection);

// PUT /api/collection/:item_id
router.put('/:item_id', collectionController.updateItemInCollection);

// DELETE /api/collection/:item_id
router.delete('/:item_id', collectionController.deleteItemInCollection);

// GET /api/collection_metrics
router.get('/metrics', collectionController.collectionMetrics);

module.exports = router;
