// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Alle ausstehenden Änderungsanfragen anzeigen
router.get('/item-changes/pending', authenticateJWT, adminMiddleware, adminController.getPendingItemChanges);

// Einzelne Änderungsanfrage anzeigen
router.get('/item-changes/:id', authenticateJWT, adminMiddleware, adminController.getItemChangeById);

// Änderungsanfrage genehmigen
router.post('/item-changes/:id/approve', authenticateJWT, adminMiddleware, adminController.approveItemChange);

// Änderungsanfrage ablehnen
router.post('/item-changes/:id/reject', authenticateJWT, adminMiddleware, adminController.rejectItemChange);

// Optional: Änderungsanfrage löschen
router.delete('/item-changes/:id', authenticateJWT, adminMiddleware, adminController.deleteItemChange);

module.exports = router;
