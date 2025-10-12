const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').populate('coordinatingClub', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new user (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, rollNo, role, year, branch, section, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNo }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Roll number already exists' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      rollNo,
      role,
      year: year || null,
      branch: branch || null,
      section: section || null,
      password // This will be hashed by the pre-save middleware
    });

    await user.save();
    
    // Return user without password hash
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;
    res.status(201).json(userResponse);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').populate('coordinatingClub', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, rollNo, role, year, branch, section, password } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email or rollNo is being changed and if it conflicts with existing users
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (rollNo !== existingUser.rollNo) {
      const rollNoExists = await User.findOne({ rollNo, _id: { $ne: userId } });
      if (rollNoExists) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      rollNo,
      role,
      year: year || null,
      branch: branch || null,
      section: section || null
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password; // This will be hashed by the pre-save middleware
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash').populate('coordinatingClub', 'name');

    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.userId === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash').populate('coordinatingClub', 'name');
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
    console.log('Profile update request received:', {
      userId: req.user.userId,
      body: req.body
    });
    
    const { name, profilePhoto, phone, department } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    
    console.log('Update data:', updateData);
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-passwordHash').populate('coordinatingClub', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Updated user:', user);
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all coordinators (admin only)
router.get('/coordinators', auth, requireRole('admin'), async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' }).select('-passwordHash').populate('coordinatingClub', 'name');
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

