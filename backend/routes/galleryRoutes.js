const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const { uploadImages, deleteImage, listByClub, listAllImages, listPendingImages, approveImage } = require('../controllers/galleryController');

// Public route to view all approved gallery images
router.get('/', listAllImages);

// Upload images (coordinator or admin)
router.post('/upload', auth, requireRole(['coordinator','admin']), uploadImages);

// Get pending images (Traces of Lenses or Admin only - checked in controller)
router.get('/pending', auth, requireRole(['coordinator','admin']), listPendingImages);

// Approve a image (Traces of Lenses or Admin only)
router.put('/:id/approve', auth, requireRole(['coordinator','admin']), approveImage);

// Delete image by id
router.delete('/:id', auth, requireRole(['coordinator','admin']), deleteImage);

// List images for a club (Internal use)
router.get('/club/:clubId', auth, listByClub);

module.exports = router;
