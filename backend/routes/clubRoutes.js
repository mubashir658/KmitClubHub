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

// Coordinator leave request management (must come before /:id routes)
router.get('/leave-requests/pending', auth, requireRole(['coordinator']), (req, res, next) => {
  console.log('Leave requests pending route hit');
  next();
}, clubController.getPendingLeaveRequests);

router.put('/leave-requests/:requestId', auth, requireRole(['coordinator']), (req, res, next) => {
  console.log('Leave request handle route hit');
  next();
}, clubController.handleLeaveRequest);

// GET /api/clubs/requests/pending - Get pending membership requests for coordinator's club
router.get('/requests/pending', auth, requireRole(['coordinator']), clubController.getPendingMembershipRequests);

// PUT /api/clubs/requests/:requestId - Approve/reject membership request
router.put('/requests/:requestId', auth, requireRole(['coordinator']), clubController.handleMembershipRequest);

// GET /api/clubs/:id
router.get('/:id', clubController.getClubById);

// PUT /api/clubs/:id - Update club information (coordinator only)
router.put('/:id', auth, requireRole(['coordinator']), clubController.updateClub);

// GET /api/clubs/:id/members - Get all members of a club
router.get('/:id/members', clubController.getClubMembers);

// POST /api/clubs/:id/invite - Invite a new member to the club (coordinator only)
router.post('/:id/invite', auth, requireRole(['coordinator']), clubController.inviteMember);

// DELETE /api/clubs/:id/members/:memberId - Remove a member from the club (coordinator only)
router.delete('/:id/members/:memberId', auth, requireRole(['coordinator']), clubController.removeMember);

// Enrollment controls
router.post('/:clubId/toggle-enrollment', auth, clubController.toggleEnrollment);
router.post('/:clubId/enroll', auth, clubController.enrollInClub);

// Student club joining/leaving
router.post('/:clubId/join', auth, clubController.joinClub);
router.post('/:clubId/request-leave', auth, (req, res, next) => {
  console.log('Request leave route hit for club:', req.params.clubId);
  next();
}, clubController.requestLeaveClub);

// Admin routes for club keys
router.get('/admin/club-keys', auth, requireRole('admin'), clubController.getAllClubKeys);
router.put('/admin/update-club-key/:clubId', auth, requireRole('admin'), clubController.updateClubKey);

module.exports = router;