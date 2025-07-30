const Club = require('../models/Club');

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