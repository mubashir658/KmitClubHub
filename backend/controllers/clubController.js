const Club = require('../models/Club');
const User = require('../models/User');

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