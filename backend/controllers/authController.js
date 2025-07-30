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

// Register new student
exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNo } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, rollNo' 
      });
    }
    
    // Check if user already exists
    const userCheck = await checkUserExists(email);
    if (userCheck.exists) {
      return res.status(400).json({ 
        message: `User with this email already exists as a ${userCheck.role}` 
      });
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      passwordHash: password,
      rollNo,
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id, 'student');

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
        rollNo: student.rollNo,
      },
    });
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
    
    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: 'All fields are required: email, password, role' 
      });
    }

    // Get user model
    let userModel;
    try {
      userModel = getUserModel(role);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        rollNo: user.rollNo,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    // Get user model
    let userModel;
    try {
      userModel = getUserModel(role);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid role in token' });
    }

    // Find user
    const user = await userModel.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject(),
      role: role
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
}; 