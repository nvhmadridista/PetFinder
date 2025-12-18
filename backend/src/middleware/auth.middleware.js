const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({error: 'No token, authorization denied'});
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await db.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({error: 'Token is not valid'});
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({error: 'Token is not valid'});
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({error: 'Access denied. Admin only.'});
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
