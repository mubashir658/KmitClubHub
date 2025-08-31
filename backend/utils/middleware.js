const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'kmit-secret-key-2024';
  
  try {
    const decoded = jwt.verify(token, secret);
    
    // Fetch user data from database to get coordinatingClub
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      userId: user._id,
      role: user.role,
      coordinatingClub: user.coordinatingClub
    };
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 

// Role-based middleware
exports.requireRole = (allowedRoles) => (req, res, next) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
  }
  next();
}; 