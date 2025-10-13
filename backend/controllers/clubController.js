const Club = require('../models/Club');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/clubs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create new club (admin only)
exports.createClub = async (req, res) => {
  try {
    const { name, description, category, clubKey, logoUrl } = req.body;
    
    // Check if club name already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ message: 'Club with this name already exists' });
    }
    
    let logoUrlToSave = logoUrl;
    
    // Handle image upload
    if (req.file) {
      logoUrlToSave = `/uploads/clubs/${req.file.filename}`;
    }
    
    const club = new Club({
      name,
      description,
      category,
      clubKey: clubKey || Math.random().toString(36).substring(2, 8).toUpperCase(),
      logoUrl: logoUrlToSave,
      enrollmentOpen: false // Default to closed
    });
    
    await club.save();
    
    res.status(201).json({
      message: 'Club created successfully',
      club
    });
  } catch (err) {
    console.error('Create club error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update club (admin only)
exports.updateClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { name, description, category, logoUrl } = req.body;
    
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check if club name already exists (excluding current club)
    if (name && name !== club.name) {
      const existingClub = await Club.findOne({ name, _id: { $ne: clubId } });
      if (existingClub) {
        return res.status(400).json({ message: 'Club with this name already exists' });
      }
    }
    
    let logoUrlToSave = club.logoUrl; // Keep existing if no new image
    
    // Handle new image upload
    if (req.file) {
      logoUrlToSave = `/uploads/clubs/${req.file.filename}`;
    } else if (logoUrl !== undefined) {
      logoUrlToSave = logoUrl;
    }
    
    // Update club fields
    if (name) club.name = name;
    if (description) club.description = description;
    if (category) club.category = category;
    if (logoUrlToSave !== undefined) club.logoUrl = logoUrlToSave;
    
    await club.save();
    
    res.json({
      message: 'Club updated successfully',
      club
    });
  } catch (err) {
    console.error('Update club error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete club (admin only)
exports.deleteClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Remove club from all users' clubs array
    await User.updateMany(
      { clubs: clubId },
      { $pull: { clubs: clubId } }
    );
    
    // Remove club from coordinators
    await User.updateMany(
      { coordinatingClub: clubId },
      { $unset: { coordinatingClub: 1 } }
    );
    
    // Delete the club
    await Club.findByIdAndDelete(clubId);
    
    res.json({ message: 'Club deleted successfully' });
  } catch (err) {
    console.error('Delete club error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Export upload middleware for use in routes
exports.upload = upload;

exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all members of a club
exports.getClubMembers = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Find all users who are members of this club
    const members = await User.find({ clubs: club._id })
      .select('name email rollNo branch year')
      .sort({ name: 1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all club keys (admin only)
exports.getAllClubKeys = async (req, res) => {
  try {
    const clubs = await Club.find({}, 'name clubKey');
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a club's key (admin only)
exports.updateClubKey = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { clubKey } = req.body;
    if (!clubKey) return res.status(400).json({ message: 'clubKey is required' });
    const club = await Club.findByIdAndUpdate(clubId, { clubKey }, { new: true });
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ message: 'Club key updated', club });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Toggle enrollment (coordinator or admin)
exports.toggleEnrollment = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Only admin or coordinator of this club
    const { role, userId } = req.user;
    if (role !== 'admin') {
      if (role !== 'coordinator') return res.status(403).json({ message: 'Forbidden' });
      const isCoordinator = club.coordinators.some((id) => String(id) === String(userId));
      if (!isCoordinator) return res.status(403).json({ message: 'Not this club coordinator' });
    }

    club.enrollmentOpen = !club.enrollmentOpen;
    await club.save();
    res.json({ message: 'Enrollment status updated', enrollmentOpen: club.enrollmentOpen });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Enroll current user (student) into a club, supply year/branch if missing
exports.enrollInClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.user;
    const { year, branch } = req.body;

    if (role !== 'student') return res.status(403).json({ message: 'Only students can enroll' });

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (!club.enrollmentOpen) return res.status(400).json({ message: 'Enrollment is closed for this club' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user is already enrolled in this club
    const alreadyMember = user.clubs.some((c) => String(c) === String(clubId));
    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already enrolled in this club' });
    }

    // Update year/branch if provided
    if (year !== undefined) user.year = year;
    if (branch !== undefined) user.branch = branch;

    // Add club to user's clubs array
    user.clubs.push(clubId);
    await user.save();

    // Fetch updated user with populated clubs
    const updatedUser = await User.findById(userId).populate('clubs');

    res.json({ 
      message: 'Enrolled successfully', 
      user: { 
        id: updatedUser._id, 
        year: updatedUser.year, 
        branch: updatedUser.branch, 
        joinedClubs: updatedUser.clubs 
      } 
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pending membership requests for coordinator's club
exports.getPendingMembershipRequests = async (req, res) => {
  try {
    const { userId, coordinatingClub } = req.user;
    
    if (!coordinatingClub) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    // Find all users who have this club in their clubs array (pending approval)
    // This is a simplified approach - in a real system you'd have a separate MembershipRequest model
    const pendingMembers = await User.find({ 
      clubs: coordinatingClub,
      role: 'student'
    })
      .select('name email rollNo branch year')
      .sort({ createdAt: -1 });

    res.json(pendingMembers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle membership request (approve/reject)
exports.handleMembershipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const { userId, coordinatingClub } = req.user;

    if (!coordinatingClub) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    // Find the user making the request
    const user = await User.findById(requestId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'approve') {
      // User is already in the club (as per current simplified model)
      res.json({ message: 'Membership request approved' });
    } else {
      // Remove user from club
      user.clubs = user.clubs.filter(clubId => String(clubId) !== String(coordinatingClub));
      await user.save();
      res.json({ message: 'Membership request rejected' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Join a club with club key
exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { clubKey } = req.body;
    const { userId, role } = req.user;

    if (role !== 'student') {
      return res.status(403).json({ message: 'Only students can join clubs' });
    }

    if (!clubKey) {
      return res.status(400).json({ message: 'Club key is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (!club.enrollmentOpen) {
      return res.status(400).json({ message: 'Enrollment is closed for this club' });
    }

    if (club.clubKey !== clubKey) {
      return res.status(400).json({ message: 'Invalid club key' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const alreadyMember = user.clubs.some((c) => String(c) === String(clubId));
    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this club' });
    }

    // Add club to user's clubs array
    user.clubs.push(clubId);
    await user.save();

    res.json({ message: 'Successfully joined the club!' });
  } catch (err) {
    console.error('Join club error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Request to leave a club
exports.requestLeaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { reason } = req.body;
    const { userId, role } = req.user;

    console.log('requestLeaveClub - Request:', { clubId, reason, userId, role });

    if (role !== 'student') {
      console.log('Access denied - not a student');
      return res.status(403).json({ message: 'Only students can request to leave clubs' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a member
    const isMember = user.clubs.some((c) => String(c) === String(clubId));
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this club' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if there's already a pending leave request
    const existingRequest = await LeaveRequest.findOne({
      student: userId,
      club: clubId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending leave request for this club' });
    }

    // Find the coordinator for this club
    const coordinator = await User.findOne({
      coordinatingClub: clubId,
      role: 'coordinator'
    });

    if (!coordinator) {
      return res.status(400).json({ message: 'No coordinator found for this club' });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      student: userId,
      club: clubId,
      coordinator: coordinator._id,
      reason: reason || ''
    });

    await leaveRequest.save();

    res.json({ message: 'Leave request submitted successfully! Waiting for coordinator approval.' });
  } catch (err) {
    console.error('Request leave club error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pending leave requests for coordinator's club
exports.getPendingLeaveRequests = async (req, res) => {
  try {
    const { coordinatingClub, userId, role } = req.user;
    console.log('getPendingLeaveRequests - User:', { userId, role, coordinatingClub });

    if (!coordinatingClub) {
      console.log('No coordinatingClub found for user:', userId);
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    const leaveRequests = await LeaveRequest.find({
      club: coordinatingClub,
      status: 'pending'
    })
    .populate('student', 'name email rollNo branch year')
    .populate('club', 'name')
    .sort({ createdAt: -1 });

    console.log('Found leave requests:', leaveRequests.length);
    res.json(leaveRequests);
  } catch (err) {
    console.error('Get pending leave requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle leave request (approve/reject)
exports.handleLeaveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const { coordinatingClub } = req.user;

    if (!coordinatingClub) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    const leaveRequest = await LeaveRequest.findById(requestId)
      .populate('student')
      .populate('club');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (String(leaveRequest.club._id) !== String(coordinatingClub)) {
      return res.status(403).json({ message: 'You are not authorized to handle this request' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    if (action === 'approve') {
      // Remove student from club
      const user = await User.findById(leaveRequest.student._id);
      if (user) {
        user.clubs = user.clubs.filter(clubId => String(clubId) !== String(leaveRequest.club._id));
        await user.save();
      }
    }

    // Update leave request status
    leaveRequest.status = action === 'approve' ? 'approved' : 'rejected';
    leaveRequest.processedAt = new Date();
    await leaveRequest.save();

    const message = action === 'approve' 
      ? 'Leave request approved. Student has been removed from the club.'
      : 'Leave request rejected. Student remains in the club.';

    res.json({ message });
  } catch (err) {
    console.error('Handle leave request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};