const jwt = require('jsonwebtoken');

// Authentication middleware
exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'kmit-secret-key-2024';
  
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 

// Role-based middleware
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
  }
  next();
}; 