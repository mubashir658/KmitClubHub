const express = require('express');
const clubController = require('../controllers/clubController');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');

// GET /api/clubs - Fetch all clubs
router.get('/', (req, res) => {
  const Club = require('../models/Club');
  Club.find()
    .select('name clubKey') // Fetch only name and clubKey for dropdown
    .then(clubs => res.json(clubs))
    .catch(err => res.status(500).json({ message: 'Error fetching clubs', error: err.message }));
});

// GET /api/clubs/:id
router.get('/:id', clubController.getClubById);

// Admin routes for club keys
router.get('/admin/club-keys', auth, requireRole('admin'), clubController.getAllClubKeys);
router.put('/admin/update-club-key/:clubId', auth, requireRole('admin'), clubController.updateClubKey);

module.exports = router;