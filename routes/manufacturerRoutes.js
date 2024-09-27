// routes/manufacturerRoutes.js

const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturerController');
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

// Get all manufacturers
router.get('/', manufacturerController.getManufacturers);

// Add a manufacturer
router.post('/', authenticateJWT, adminMiddleware, manufacturerController.addManufacturer);

// Update a manufacturer
router.put('/:id', authenticateJWT, adminMiddleware, manufacturerController.updateManufacturer);

// Delete a manufacturer
router.delete('/:id', authenticateJWT, adminMiddleware, manufacturerController.deleteManufacturer);

// Upload manufacturer image
router.post('/:manufacturer_id/upload-image', authenticateJWT, adminMiddleware, upload.single('file'), manufacturerController.uploadManufacturerImage);

module.exports = router;
