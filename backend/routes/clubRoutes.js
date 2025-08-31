const express = require('express');
const clubController = require('../controllers/clubController');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');

// GET /api/clubs - Fetch all clubs with full details
router.get('/', (req, res) => {
  const Club = require('../models/Club');
  Club.find()
    .select('name description logoUrl category enrollmentOpen coordinators')
    .then(clubs => res.json(clubs))
    .catch(err => res.status(500).json({ message: 'Error fetching clubs', error: err.message }));
});

// GET /api/clubs/:id
router.get('/:id', clubController.getClubById);

// GET /api/clubs/:id/members - Get all members of a club
router.get('/:id/members', clubController.getClubMembers);

// GET /api/clubs/requests/pending - Get pending membership requests for coordinator's club
router.get('/requests/pending', auth, requireRole(['coordinator']), clubController.getPendingMembershipRequests);

// PUT /api/clubs/requests/:requestId - Approve/reject membership request
router.put('/requests/:requestId', auth, requireRole(['coordinator']), clubController.handleMembershipRequest);

// Enrollment controls
router.post('/:clubId/toggle-enrollment', auth, clubController.toggleEnrollment);
router.post('/:clubId/enroll', auth, clubController.enrollInClub);

// Admin routes for club keys
router.get('/admin/club-keys', auth, requireRole('admin'), clubController.getAllClubKeys);
router.put('/admin/update-club-key/:clubId', auth, requireRole('admin'), clubController.updateClubKey);

module.exports = router;