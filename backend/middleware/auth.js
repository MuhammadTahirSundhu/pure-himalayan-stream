// middleware/auth.js — OneWater Pakistan
// JWT verification middleware for all /api/admin/* routes

import jwt from 'jsonwebtoken';

/**
 * Verifies the Authorization: Bearer <token> header.
 * Attaches decoded payload to req.admin on success.
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No token provided. Please log in.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'TokenExpired', 
        message: 'Your session has expired. Please log in again.' 
      });
    }
    return res.status(401).json({ 
      error: 'InvalidToken', 
      message: 'Invalid authentication token.' 
    });
  }
};
