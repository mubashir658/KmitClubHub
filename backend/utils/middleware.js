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