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

    // update year/branch if provided
    if (year !== undefined) user.year = year;
    if (branch !== undefined) user.branch = branch;

    // add club to user if not already
    const alreadyMember = user.clubs.some((c) => String(c) === String(clubId));
    if (!alreadyMember) user.clubs.push(clubId);

    await user.save();

    res.json({ message: 'Enrolled successfully', user: { id: user._id, year: user.year, branch: user.branch, clubs: user.clubs } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};