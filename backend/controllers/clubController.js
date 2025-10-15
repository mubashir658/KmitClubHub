const Club = require('../models/Club');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');

// Create a new club (admin only)
exports.createClub = async (req, res) => {
  try {
    const {
      name,
      description,
      logoUrl,
      category,
      instagram,
      clubKey,
      enrollmentOpen,
      teamHeads,
    } = req.body;

    if (!name || !description || !category || !clubKey) {
      return res.status(400).json({ message: 'name, description, category and clubKey are required' });
    }

    const existing = await Club.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Club name already exists' });
    }

    const club = new Club({
      name,
      description,
      logoUrl: logoUrl || '',
      category,
      instagram: instagram || '',
      clubKey,
      enrollmentOpen: Boolean(enrollmentOpen),
      teamHeads: Array.isArray(teamHeads) ? teamHeads : [],
    });

    await club.save();
    return res.status(201).json({ message: 'Club created successfully', club });
  } catch (err) {
    console.error('Create club error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Club name already exists' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('coordinators', 'name email rollNo');
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update club information (coordinator only)
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, category, instagram, teamHeads, eventsConducted, upcomingEvents } = req.body;
    const { coordinatingClub } = req.user;

    // Check if coordinator is assigned to this club
    if (!coordinatingClub || String(coordinatingClub) !== String(id)) {
      return res.status(403).json({ message: 'You can only update your assigned club' });
    }

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Update allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (category !== undefined) updateData.category = category;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (teamHeads !== undefined) updateData.teamHeads = teamHeads;
    if (eventsConducted !== undefined) updateData.eventsConducted = eventsConducted;
    if (upcomingEvents !== undefined) updateData.upcomingEvents = upcomingEvents;

    const updatedClub = await Club.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Club updated successfully', club: updatedClub });
  } catch (err) {
    console.error('Update club error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Club name already exists' });
    }
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

// Enroll current user (student) into a club
// If this is the student's first enrollment (academicInfoSet=false), require and persist academic info once
exports.enrollInClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.user;
    const { year, branch, section } = req.body;

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

    // For first-time enrollment, require academic info and lock it in
    if (!user.academicInfoSet) {
      if (year == null || branch == null || section == null || section === '') {
        return res.status(400).json({ message: 'Year, branch, and section are required for first-time enrollment' });
      }
      user.year = year;
      user.branch = branch;
      user.section = section;
      user.academicInfoSet = true;
    } else {
      // If already set once, ignore any attempted changes to academic info
      // No-op to prevent changing branch/section via enroll endpoint
    }

    // Add club to user's clubs array
    user.clubs.push(clubId);
    await user.save();

    // Update club membership stats (by year and branch)
    try {
      const ClubMembershipStats = require('../models/ClubMembershipStats');
      const stats = await ClubMembershipStats.findOne({ club: clubId }) || new (require('../models/ClubMembershipStats'))({ club: clubId });
      stats.totalMembers = (stats.totalMembers || 0) + 1;
      if (user.year != null) {
        const yearKey = String(user.year);
        stats.byYear.set(yearKey, (stats.byYear.get(yearKey) || 0) + 1);
      }
      if (user.branch) {
        const branchKey = String(user.branch);
        stats.byBranch.set(branchKey, (stats.byBranch.get(branchKey) || 0) + 1);
      }
      stats.updatedAt = new Date();
      await stats.save();
    } catch (statsErr) {
      console.error('Error updating ClubMembershipStats:', statsErr.message);
    }

    // Fetch updated user with populated clubs
    const updatedUser = await User.findById(userId).populate('clubs');

    res.json({ 
      message: 'Enrolled successfully', 
      user: { 
        id: updatedUser._id, 
        year: updatedUser.year, 
        branch: updatedUser.branch, 
        section: updatedUser.section,
        academicInfoSet: updatedUser.academicInfoSet,
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
    const MembershipApproval = require('../models/MembershipApproval');
    const approvals = await MembershipApproval.find({ club: coordinatingClub }).select('student');
    const approvedStudentIds = new Set(approvals.map(a => String(a.student)));

    const pendingMembers = await User.find({ 
      clubs: coordinatingClub,
      role: 'student',
      _id: { $nin: Array.from(approvedStudentIds) }
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
      const MembershipApproval = require('../models/MembershipApproval');
      // Record approval; unique index prevents duplicates
      await MembershipApproval.updateOne(
        { student: user._id, club: coordinatingClub },
        { $setOnInsert: { approvedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ message: 'Membership request approved' });
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

    // Fetch updated user with populated clubs
    const updatedUser = await User.findById(userId).populate('clubs');

    res.json({ 
      message: 'Successfully joined the club!',
      user: {
        id: updatedUser._id,
        year: updatedUser.year,
        branch: updatedUser.branch,
        joinedClubs: updatedUser.clubs
      }
    });
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

// Invite a new member to the club (coordinator only)
exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, rollNo, year, branch, section, password } = req.body;
    const { coordinatingClub } = req.user;

    // Check if coordinator is assigned to this club
    if (!coordinatingClub || String(coordinatingClub) !== String(id)) {
      return res.status(403).json({ message: 'You can only invite members to your assigned club' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNo }] 
    });

    if (existingUser) {
      // If user exists, check if they're already in the club
      if (existingUser.clubs.includes(id)) {
        return res.status(400).json({ message: 'User is already a member of this club' });
      }
      
      // Add user to club
      existingUser.clubs.push(id);
      await existingUser.save();
      
      return res.json({ 
        message: 'Existing user added to club successfully', 
        member: existingUser 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      rollNo,
      year: year ? parseInt(year) : undefined,
      branch,
      section,
      password,
      role: 'student',
      clubs: [id]
    });

    await newUser.save();

    res.json({ 
      message: 'New member invited and added to club successfully', 
      member: newUser 
    });
  } catch (err) {
    console.error('Invite member error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User with this email or roll number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove a member from the club (coordinator only)
exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { coordinatingClub } = req.user;

    // Check if coordinator is assigned to this club
    if (!coordinatingClub || String(coordinatingClub) !== String(id)) {
      return res.status(403).json({ message: 'You can only remove members from your assigned club' });
    }

    // Find the user
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is actually in the club
    if (!user.clubs.includes(id)) {
      return res.status(400).json({ message: 'User is not a member of this club' });
    }

    // Remove user from club
    user.clubs = user.clubs.filter(clubId => String(clubId) !== String(id));
    await user.save();

    res.json({ message: 'Member removed from club successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};