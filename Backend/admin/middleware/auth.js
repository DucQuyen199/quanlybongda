const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

/**
 * Authorization middleware to check for ADMIN role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  if (req.user.vaiTro !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }

  next();
};

module.exports = {
  authenticateToken,
  isAdmin
}; 