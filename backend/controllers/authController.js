const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'kmit-secret-key-2024';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};

// Register new user (only for students)
exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNo } = req.body;
    
    // Debug logging
    console.log('Registration request received:', { name, email, rollNo });
    
    // Validate required fields
    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, rollNo' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNo }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Create new student user
    const userData = {
      name,
      email,
      rollNo,
      passwordHash: password, // Will be hashed by pre-save hook
      role: 'student'
    };

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id, 'student');

    const responseData = {
      message: 'Student registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: 'student',
        year: user.year,
        branch: user.branch,
        coordinatingClub: user.coordinatingClub,
        joinedClubs: [] // New user has no clubs yet
      }
    };
    
    console.log('Student registered successfully:', user._id);
    res.status(201).json(responseData);
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or roll number already exists' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user (for all roles)
exports.login = async (req, res) => {
  try {
    const { rollNo, password } = req.body;
    
    if (!rollNo || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    // Find user by roll number
    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(400).json({ message: 'Invalid roll number or password' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid roll number or password' });
    }

    // Populate clubs separately
    let populatedClubs = [];
    if (user.clubs && user.clubs.length > 0) {
      const Club = require('../models/Club');
      populatedClubs = await Club.find({ _id: { $in: user.clubs } });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,
        year: user.year,
        branch: user.branch,
        coordinatingClub: user.coordinatingClub,
        joinedClubs: populatedClubs // Use populated clubs
      }
    };

    console.log('Login successful for:', user.role, user._id);
    res.json(responseData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile endpoint - User clubs (before populate):', user.clubs);
    console.log('Profile endpoint - User clubs length (before populate):', user.clubs ? user.clubs.length : 0);

    // Populate clubs separately to debug
    let populatedClubs = [];
    if (user.clubs && user.clubs.length > 0) {
      const Club = require('../models/Club');
      populatedClubs = await Club.find({ _id: { $in: user.clubs } });
      console.log('Profile endpoint - Populated clubs:', populatedClubs);
      console.log('Profile endpoint - Populated clubs length:', populatedClubs.length);
    }

    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNo: user.rollNo,
      role: user.role,
      year: user.year,
      branch: user.branch,
      profilePhoto: user.profilePhoto,
      coordinatingClub: user.coordinatingClub,
      joinedClubs: populatedClubs, // Use populated clubs
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('Profile endpoint - Response joinedClubs:', responseData.joinedClubs);
    console.log('Profile endpoint - Response joinedClubs length:', responseData.joinedClubs ? responseData.joinedClubs.length : 0);
    
    res.json(responseData);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Admin creates a new coordinator
exports.createCoordinator = async (req, res) => {
  try {
    const { name, rollNo, email, password, clubId } = req.body;
    
    if (!name || !rollNo || !email || !password || !clubId) {
      return res.status(400).json({ 
        message: 'All fields are required: name, rollNo, email, password, clubId' 
      });
    }

    // Check if coordinator already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNo }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Create coordinator user
    const coordinatorData = {
      name,
      email,
      rollNo,
      passwordHash: password, // Will be hashed by pre-save hook
      role: 'coordinator',
      coordinatingClub: clubId
    };

    const coordinator = new User(coordinatorData);
    await coordinator.save();

    // Add coordinator to club
    const Club = require('../models/Club');
    await Club.findByIdAndUpdate(clubId, {
      $push: { coordinators: coordinator._id }
    });

    res.status(201).json({ 
      message: 'Coordinator created successfully', 
      coordinator: {
        id: coordinator._id,
        name: coordinator.name,
        rollNo: coordinator.rollNo,
        email: coordinator.email,
        role: 'coordinator',
        coordinatingClub: coordinator.coordinatingClub,
        clubs: coordinator.clubs
      }
    });
  } catch (err) {
    console.error('Create coordinator error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or roll number already exists' });
    }
    res.status(500).json({ message: 'Server error during coordinator creation' });
  }
};

// Change password (for coordinators and students)
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// Fix coordinator club assignment (admin only)
exports.fixCoordinatorClubAssignment = async (req, res) => {
  try {
    const { coordinatorId, clubId } = req.body;
    
    if (!coordinatorId || !clubId) {
      return res.status(400).json({ 
        message: 'coordinatorId and clubId are required' 
      });
    }

    // Find coordinator
    const coordinator = await User.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    if (coordinator.role !== 'coordinator') {
      return res.status(400).json({ message: 'User is not a coordinator' });
    }

    // Find club
    const Club = require('../models/Club');
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Update coordinator with coordinatingClub
    await User.findByIdAndUpdate(coordinatorId, {
      coordinatingClub: clubId
    });

    // Add coordinator to club's coordinators array
    await Club.findByIdAndUpdate(clubId, {
      $addToSet: { coordinators: coordinatorId }
    });

    res.json({ 
      message: 'Coordinator club assignment fixed successfully',
      coordinator: {
        id: coordinator._id,
        name: coordinator.name,
        coordinatingClub: clubId
      },
      club: {
        id: club._id,
        name: club.name
      }
    });
  } catch (err) {
    console.error('Fix coordinator club assignment error:', err);
    res.status(500).json({ message: 'Server error while fixing coordinator club assignment' });
  }
};

// Update user profile (for students to add year and branch later)
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { year, branch } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (year !== undefined) user.year = year;
    if (branch !== undefined) user.branch = branch;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,
        year: user.year,
        branch: user.branch
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
}; 