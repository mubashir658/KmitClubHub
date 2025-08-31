const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const Feedback = require('../models/Feedback');

// Student submits feedback to a club
router.post('/', auth, requireRole(['student']), async (req, res) => {
  try {
    const { clubId, subject, message, type } = req.body;
    const studentId = req.user.id;

    const feedback = new Feedback({
      student: studentId,
      club: clubId,
      subject,
      message,
      type: type || 'general',
      status: 'pending'
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coordinator sends feedback to admin
router.post('/admin', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const { subject, message, type } = req.body;
    const coordinatorId = req.user.id;

    const feedback = new Feedback({
      coordinator: coordinatorId,
      subject,
      message,
      type: type || 'general',
      status: 'pending',
      isToAdmin: true
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback for a specific club (coordinator view)
router.get('/club', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    
    // First try to get the club using coordinatingClub field
    let clubId = req.user.coordinatingClub;
    
    // If coordinatingClub is not set, try to find the club through coordinators array
    if (!clubId) {
      const Club = require('../models/Club');
      const club = await Club.findOne({ coordinators: coordinatorId });
      if (club) {
        clubId = club._id;
        console.log(`Found club for coordinator ${coordinatorId}: ${club.name}`);
      }
    }
    
    if (!clubId) {
      return res.status(404).json({ message: 'No club assigned to this coordinator' });
    }
    
    console.log(`Fetching feedback for club: ${clubId}`);
    
    const feedback = await Feedback.find({
      club: clubId,
      isToAdmin: { $ne: true }
    }).populate('student', 'name rollNo').populate('club', 'name');
    
    console.log(`Found ${feedback.length} feedback items for club ${clubId}`);
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching club feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all feedback for admin
router.get('/admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const feedback = await Feedback.find({ isToAdmin: true })
      .populate('coordinator', 'name')
      .populate('student', 'name')
      .populate('club', 'name');
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's own feedback
router.get('/my', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const feedback = await Feedback.find({ student: studentId })
      .populate('club', 'name');
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coordinator actions on feedback (resolve, forward)
router.put('/:id/action', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const { action } = req.body;
    const feedbackId = req.params.id;
    const coordinatorId = req.user.id;
    
    // First verify that this feedback belongs to the coordinator's club
    let clubId = req.user.coordinatingClub;
    
    // If coordinatingClub is not set, try to find the club through coordinators array
    if (!clubId) {
      const Club = require('../models/Club');
      const club = await Club.findOne({ coordinators: coordinatorId });
      if (club) {
        clubId = club._id;
      }
    }
    
    if (!clubId) {
      return res.status(404).json({ message: 'No club assigned to this coordinator' });
    }
    
    // Verify the feedback belongs to this coordinator's club
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (feedback.club.toString() !== clubId.toString()) {
      return res.status(403).json({ message: 'You can only act on feedback from your club' });
    }
    
    let updateData = {};
    if (action === 'resolve') {
      updateData.status = 'resolved';
    } else if (action === 'solve') {
      updateData.status = 'solved';
    } else if (action === 'forward') {
      updateData.status = 'escalated';
      updateData.isToAdmin = true;
    }
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    ).populate('student', 'name rollNo').populate('club', 'name');
    
    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin actions on feedback
router.put('/:id/admin-action', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { action } = req.body;
    const feedbackId = req.params.id;
    
    let updateData = {};
    if (action === 'resolve') {
      updateData.status = 'resolved';
    } else if (action === 'escalate') {
      updateData.status = 'escalated';
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    );
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

