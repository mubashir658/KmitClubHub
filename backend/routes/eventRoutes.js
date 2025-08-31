const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const Event = require('../models/Event');
const Club = require('../models/Club');

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('club', 'name logoUrl')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events for a specific club
router.get('/club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    const events = await Event.find({ 
      club: clubId, 
      status: 'approved' 
    })
      .populate('club', 'name logoUrl')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending events for admin approval
router.get('/admin/pending', auth, requireRole(['admin']), async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('club', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coordinator creates event (pending approval)
router.post('/', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const { title, description, date, time, venue, imageUrl } = req.body;
    const coordinatorId = req.user.userId;

    // Check if coordinator has a club
    if (!req.user.coordinatingClub) {
      return res.status(400).json({ message: 'You must be assigned to a club to create events' });
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      imageUrl: imageUrl || '',
      club: req.user.coordinatingClub,
      createdBy: coordinatorId,
      status: 'pending'
    });

    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('club', 'name')
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin approves/rejects event
router.put('/:id/approve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const eventId = req.params.id;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    ).populate('club', 'name').populate('createdBy', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get coordinator's club events
router.get('/coordinator/my-events', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    if (!req.user.coordinatingClub) {
      return res.status(400).json({ message: 'You must be assigned to a club to view events' });
    }

    const events = await Event.find({ 
      club: req.user.coordinatingClub 
    })
      .populate('club', 'name')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student registers for an event
router.post('/:id/register', auth, requireRole(['student']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot register for unapproved events' });
    }

    // Check if student is already registered
    if (event.registeredStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registeredStudents.push(studentId);
    await event.save();
    
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student unregisters from an event
router.delete('/:id/register', auth, requireRole(['student']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove student from registered list
    event.registeredStudents = event.registeredStudents.filter(
      id => id.toString() !== studentId
    );
    await event.save();
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logoUrl description')
      .populate('createdBy', 'name')
      .populate('registeredStudents', 'name rollNo');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (coordinator can update pending events)
router.put('/:id', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, time, venue, imageUrl } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow updates to pending events
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending events' });
    }

    // Check if coordinator owns this event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, description, date, time, venue, imageUrl },
      { new: true }
    ).populate('club', 'name').populate('createdBy', 'name');
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (coordinator can delete pending events)
router.delete('/:id', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow deletion of pending events
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending events' });
    }

    // Check if coordinator owns this event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
