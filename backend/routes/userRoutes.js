const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, profilePhoto },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all coordinators (admin only)
router.get('/coordinators', auth, requireRole('admin'), async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' }).select('-passwordHash');
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

