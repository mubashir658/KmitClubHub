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
    
    console.log('Events API - Total events:', events.length);
    console.log('Events API - Events with imageUrl:', events.filter(e => e.imageUrl).length);
    console.log('Events API - Sample event with imageUrl:', events.find(e => e.imageUrl));
    
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

// Get admin-created events for all clubs
router.get('/admin/all-clubs-events', auth, requireRole(['admin']), async (req, res) => {
  try {
    const events = await Event.find({ isForAllClubs: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming approved events (any scope) for admin
router.get('/admin/upcoming', auth, requireRole(['admin']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await Event.find({ status: 'approved', date: { $gte: today } })
      .populate('club', 'name logoUrl')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin creates event for all clubs
router.post('/admin/create-for-all-clubs', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { title, description, date, time, venue, imageUrl, registrationOpen } = req.body;
    const adminId = req.user.userId;

    console.log('Creating event with imageUrl:', imageUrl);
    console.log('ImageUrl type:', typeof imageUrl);
    console.log('ImageUrl length:', imageUrl?.length);

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      imageUrl: imageUrl || '',
      isForAllClubs: true,
      registrationOpen: Boolean(registrationOpen),
      createdBy: adminId,
      status: 'approved' // Admin events are auto-approved
    });

    await event.save();
    console.log('Event saved with imageUrl:', event.imageUrl);
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin activates/deactivates event for all clubs
router.put('/admin/:id/toggle-status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { action } = req.body; // 'activate' or 'deactivate'
    
    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "activate" or "deactivate"' });
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.isForAllClubs) {
      return res.status(400).json({ message: 'This endpoint is only for admin-created events for all clubs' });
    }
    
    const status = action === 'activate' ? 'approved' : 'rejected';
    event.status = status;
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name');
    
    res.json({ message: `Event ${action}d successfully`, event: populatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin opens/closes registration for all-clubs event
router.put('/admin/:id/toggle-registration', auth, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { open } = req.body; // boolean

    if (typeof open !== 'boolean') {
      return res.status(400).json({ message: 'Invalid payload: open must be boolean' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isForAllClubs) {
      return res.status(400).json({ message: 'This endpoint is only for admin-created events for all clubs' });
    }

    event.registrationOpen = open;
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name');

    res.json({ message: `Registration ${open ? 'opened' : 'closed'} successfully`, event: populatedEvent });
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

// Coordinator activates a rejected event (sets status to approved)
router.put('/:id/activate', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    console.log('Activate route hit for event:', req.params.id);
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.club) !== String(req.user.coordinatingClub)) {
      return res.status(403).json({ message: 'Not authorized to activate this event' });
    }
    if (event.status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected events can be activated' });
    }
    event.status = 'approved';
    await event.save();
    console.log('Event activated successfully:', eventId);
    res.json({ message: 'Event activated', event });
  } catch (error) {
    console.error('Activate error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Coordinator deactivates an approved event (sets status to rejected)
router.put('/:id/deactivate', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    console.log('Deactivate route hit for event:', req.params.id);
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.club) !== String(req.user.coordinatingClub)) {
      return res.status(403).json({ message: 'Not authorized to deactivate this event' });
    }
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved events can be deactivated' });
    }
    event.status = 'rejected';
    await event.save();
    console.log('Event deactivated successfully:', eventId);
    res.json({ message: 'Event deactivated', event });
  } catch (error) {
    console.error('Deactivate error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Coordinator opens/closes registration for their club's event
router.put('/:id/toggle-registration', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { open } = req.body; // boolean

    if (typeof open !== 'boolean') {
      return res.status(400).json({ message: 'Invalid payload: open must be boolean' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.club) !== String(req.user.coordinatingClub)) {
      return res.status(403).json({ message: 'Not authorized to modify registration for this event' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved events can toggle registrations' });
    }

    event.registrationOpen = open;
    await event.save();
    res.json({ message: `Registration ${open ? 'opened' : 'closed'} successfully`, event });
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
    const studentIdStr = String(studentId);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot register for unapproved events' });
    }

    if (!event.registrationOpen) {
      return res.status(400).json({ message: 'Registrations are currently closed for this event' });
    }

    // Check if student is already registered (normalize comparison)
    const alreadyRegistered = (event.registeredStudents || []).some((id) => {
      const current = typeof id === 'string' ? id : id?.toString();
      return current === studentIdStr;
    });
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if student can register for this event
    // Allow registration if:
    // 1. It's an admin event for all clubs (isForAllClubs = true)
    // 2. Student is a member of the club that created the event
    const eventClubId = event.club?.toString();
    if (!event.isForAllClubs) {
      // Confirm membership from DB using req.user.id
      const dbUser = await require('../models/User').findById(req.user.id).select('clubs');
      const studentClubIds = (dbUser?.clubs || []).map(id => id.toString());
      if (!studentClubIds.includes(eventClubId)) {
        return res.status(403).json({ 
          message: 'You can only register for events from clubs you are a member of' 
        });
      }
    }

    event.registeredStudents.push(studentId);
    await event.save();

    // Update event registration analytics (by year, branch, and student club)
    try {
      const dbUser = await require('../models/User').findById(studentId).select('year branch clubs');
      const EventRegistrationStats = require('../models/EventRegistrationStats');
      const statsModel = require('../models/EventRegistrationStats');
      let stats = await EventRegistrationStats.findOne({ event: eventId });
      if (!stats) {
        stats = new statsModel({ event: eventId });
      }
      stats.totalRegistrations = (stats.totalRegistrations || 0) + 1;
      if (dbUser?.year != null) {
        const y = String(dbUser.year);
        stats.byYear.set(y, (stats.byYear.get(y) || 0) + 1);
      }
      if (dbUser?.branch) {
        const b = String(dbUser.branch);
        stats.byBranch.set(b, (stats.byBranch.get(b) || 0) + 1);
      }
      if (dbUser?.clubs && dbUser.clubs.length) {
        for (const c of dbUser.clubs) {
          const key = String(c);
          stats.byClub.set(key, (stats.byClub.get(key) || 0) + 1);
        }
      }
      stats.updatedAt = new Date();
      await stats.save();
    } catch (analyticsErr) {
      console.error('Error updating EventRegistrationStats:', analyticsErr.message);
    }
    
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
    const studentIdStr = String(studentId);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ensure student is currently registered
    const isRegistered = (event.registeredStudents || []).some((id) => {
      const current = typeof id === 'string' ? id : id?.toString();
      return current === studentIdStr;
    });
    if (!isRegistered) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    // Remove student from registered list (normalize comparison to strings)
    event.registeredStudents = (event.registeredStudents || []).filter((id) => {
      const current = typeof id === 'string' ? id : id?.toString();
      return current !== studentIdStr;
    });
    await event.save();
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (coordinator can update only when event is pending and belongs to their club)
router.put('/:id', auth, requireRole(['coordinator']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, time, venue, imageUrl } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Must be pending to edit
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending events' });
    }

    // Authorization: creator OR coordinator of this event's club
    const isCreator = String(event.createdBy) === String(req.user.id)
    const isClubCoordinator = String(event.club) === String(req.user.coordinatingClub)
    if (!isCreator && !isClubCoordinator) {
      console.log('Update denied:', {
        eventId: event._id.toString(),
        eventClub: event.club?.toString(),
        userId: req.user.id?.toString(),
        coordinatingClub: req.user.coordinatingClub?.toString()
      })
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, description, date, time, venue, imageUrl },
      { new: true }
    ).populate('club', 'name').populate('createdBy', 'name');

    res.json({ message: 'Event updated. Pending admin approval.', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin updates approved future event
router.put('/admin/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, time, venue, imageUrl } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent editing past events
    const isPast = new Date(event.date) < new Date();
    if (isPast) {
      return res.status(400).json({ message: 'Cannot edit past events' });
    }

    // Only allow updates when approved (live)
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved events can be edited by admin' });
    }

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.date = date ?? event.date;
    event.time = time ?? event.time;
    event.venue = venue ?? event.venue;
    event.imageUrl = imageUrl ?? event.imageUrl;
    await event.save();

    const populated = await Event.findById(event._id).populate('createdBy', 'name');
    res.json({ message: 'Event updated successfully', event: populated });
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

// Admin delete event (can delete any event)
router.delete('/admin/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent deleting past events
    const isPast = new Date(event.date) < new Date();
    if (isPast) {
      return res.status(400).json({ message: 'Cannot delete past events' });
    }

    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted successfully' });
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

module.exports = router;
