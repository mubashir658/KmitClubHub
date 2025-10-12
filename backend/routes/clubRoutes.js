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

// GET /api/clubs/statistics - Get public statistics
router.get('/statistics', async (req, res) => {
  try {
    const Club = require('../models/Club');
    const User = require('../models/User');
    const Event = require('../models/Event');
    
    const [clubs, users, events] = await Promise.all([
      Club.find(),
      User.find(),
      Event.find({ status: 'approved' })
    ]);
    
    console.log('Statistics Debug:');
    console.log('Total users:', users.length);
    console.log('Students:', users.filter(u => u.role === 'student').length);
    console.log('Users with clubs:', users.filter(u => u.clubs && u.clubs.length > 0).length);
    console.log('Sample user clubs:', users.slice(0, 5).map(u => ({ 
      name: u.name, 
      role: u.role, 
      clubs: u.clubs?.length || 0,
      clubsArray: u.clubs 
    })));
    
    // Calculate active members (students who have joined at least one club)
    const activeMembers = users.filter(user => 
      user.role === 'student' && user.clubs && user.clubs.length > 0
    ).length;
    
    console.log('Active members calculated:', activeMembers);
    console.log('Students with clubs details:', users.filter(u => u.role === 'student' && u.clubs && u.clubs.length > 0).map(u => ({
      name: u.name,
      clubs: u.clubs.length,
      clubsArray: u.clubs
    })));
    
    // Calculate events this year
    const currentYear = new Date().getFullYear();
    const eventsThisYear = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === currentYear;
    }).length;
    
    res.json({
      clubs: clubs.length,
      members: activeMembers,
      events: eventsThisYear
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
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

// GET /api/clubs/:id/members - Get all members of a club
router.get('/:id/members', clubController.getClubMembers);

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