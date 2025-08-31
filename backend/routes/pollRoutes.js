const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const pollController = require('../controllers/pollController');

// Student/coordinator/admin: list active polls per visibility
router.get('/active', auth, pollController.getActivePollsForUser);

// Vote in a poll
router.post('/:pollId/vote', auth, pollController.vote);

// Coordinator: create club poll
router.post('/club', auth, requireRole('coordinator'), pollController.createPoll);
// Coordinator: list club polls (optional ?clubId=)
router.get('/club', auth, requireRole('coordinator'), pollController.getCoordinatorClubPolls);

// Admin: create polls for all/coordinators/club
router.post('/', auth, requireRole('admin'), pollController.createPoll);
// Admin: manage list
router.get('/manage', auth, requireRole('admin'), pollController.adminList);

module.exports = router;



