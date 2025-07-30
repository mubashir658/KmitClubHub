const Student = require('../models/Student');
const Coordinator = require('../models/Coordinator');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'kmit-secret-key-2024';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};

// Get user model based on role
const getUserModel = (role) => {
  switch (role) {
    case 'student': return Student;
    case 'coordinator': return Coordinator;
    case 'admin': return Admin;
    default: throw new Error('Invalid role');
  }
};

// Check if user exists in any collection
const checkUserExists = async (email) => {
  const student = await Student.findOne({ email });
  if (student) return { exists: true, role: 'student' };
  
  const coordinator = await Coordinator.findOne({ email });
  if (coordinator) return { exists: true, role: 'coordinator' };
  
  const admin = await Admin.findOne({ email });
  if (admin) return { exists: true, role: 'admin' };
  
  return { exists: false };
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNo, role } = req.body;
    
    // Debug logging
    console.log('Registration request received:')
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('RollNo:', rollNo)
    console.log('Role:', role)
    console.log('Full request body:', req.body)
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('Missing required fields')
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, role' 
      });
    }
    if ((role === 'student' || role === 'coordinator') && !rollNo) {
      console.log('Missing rollNo for student/coordinator')
      return res.status(400).json({ 
        message: 'Roll number is required for students and coordinators' 
      });
    }

    // Validate role
    if (!['student', 'coordinator', 'admin'].includes(role)) {
      console.log('Invalid role:', role)
      return res.status(400).json({ 
        message: 'Invalid role. Must be student, coordinator, or admin' 
      });
    }
    
    // Check if user already exists
    const userCheck = await checkUserExists(email);
    if (userCheck.exists) {
      console.log('User already exists as:', userCheck.role)
      return res.status(400).json({ 
        message: `User with this email already exists as a ${userCheck.role}` 
      });
    }

    // Check if roll number already exists (for student/coordinator only)
    if (role === 'student' || role === 'coordinator') {
      const existingStudent = await Student.findOne({ rollNo });
      const existingCoordinator = await Coordinator.findOne({ rollNo });
      if (existingStudent || existingCoordinator) {
        console.log('Roll number already exists')
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }

    // Get user model
    let userModel;
    try {
      userModel = getUserModel(role);
      console.log('Selected user model for role:', role)
    } catch (error) {
      console.log('Error getting user model:', error.message)
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      passwordHash: password,
    };
    if (role === 'student' || role === 'coordinator') {
      userData.rollNo = rollNo;
    }

    // Coordinator clubKey validation
    if (role === 'coordinator') {
      const { clubKey, club } = req.body;
      if (!clubKey || !club) {
        return res.status(400).json({ message: 'Club and club pass key are required for coordinator signup' });
      }
      const Club = require('../models/Club');
      const clubDoc = await Club.findOne({ name: club });
      if (!clubDoc || clubDoc.clubKey !== clubKey) {
        return res.status(400).json({ message: 'Invalid club pass key' });
      }
      userData.club = club;
      userData.clubKey = clubKey;
    }

    // Create new user
    console.log('Creating user with model:', userModel.modelName)
    const user = new userModel(userData);
    await user.save();
    console.log('User saved successfully with ID:', user._id)

    // Generate token
    const token = generateToken(user._id, role);
    console.log('Generated token with role:', role)

    // Prepare response user object
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: role,
    };
    if (role === 'student' || role === 'coordinator') {
      responseUser.rollNo = user.rollNo;
    }

    const responseData = {
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: responseUser,
    };
    
    console.log('Sending response:', responseData)
    res.status(201).json(responseData);
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or roll number already exists' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Debug logging
    console.log('Login request received:')
    console.log('Email:', email)
    console.log('Role:', role)
    console.log('Full request body:', req.body)
    
    // Validate required fields
    if (!email || !password || !role) {
      console.log('Missing required fields for login')
      return res.status(400).json({ 
        message: 'All fields are required: email, password, role' 
      });
    }

    // Get user model
    let userModel;
    try {
      userModel = getUserModel(role);
      console.log('Selected user model for login role:', role)
    } catch (error) {
      console.log('Error getting user model for login:', error.message)
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('User not found in model:', userModel.modelName)
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user.name, 'in model:', userModel.modelName)

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch')
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, role);
    console.log('Generated login token with role:', role)

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        rollNo: user.rollNo,
      },
    };
    
    console.log('Sending login response:', responseData)
    res.json(responseData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    // Debug logging
    console.log('Get profile request:')
    console.log('User ID:', userId)
    console.log('Role from token:', role)
    
    // Get user model
    let userModel;
    try {
      userModel = getUserModel(role);
      console.log('Selected user model for profile:', userModel.modelName)
    } catch (error) {
      console.log('Error getting user model for profile:', error.message)
      return res.status(400).json({ message: 'Invalid role in token' });
    }

    // Find user
    const user = await userModel.findById(userId).select('-passwordHash');
    if (!user) {
      console.log('User not found in profile lookup')
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile user found:', user.name, 'Role:', role)

    const responseData = {
      ...user.toObject(),
      role: role
    };
    
    console.log('Sending profile response:', responseData)
    res.json(responseData);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
}; 