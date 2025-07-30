const express = require('express');
const clubController = require('../controllers/clubController');
const router = express.Router();

// GET /api/clubs/:id
router.get('/:id', clubController.getClubById);

module.exports = router;