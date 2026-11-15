// middleware/auth.js — JWT verification for /api/admin/*
// Tokens carry the admin's token_version; bumping it (e.g. on password change)
// revokes every existing session.
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const JWT_OPTIONS = { algorithms: ['HS256'] };

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Please log in.' });
  }
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, JWT_OPTIONS);
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: expired ? 'TokenExpired' : 'InvalidToken',
      message: expired ? 'Your session has expired. Please log in again.' : 'Please log in again.',
    });
  }
  try {
    const { rows } = await pool.query('SELECT token_version FROM public.admin_users WHERE id = $1', [decoded.id]);
    if (!rows.length || rows[0].token_version !== (decoded.tv ?? 0)) {
      return res.status(401).json({ error: 'SessionRevoked', message: 'Please log in again.' });
    }
  } catch (err) {
    return next(err);
  }
  req.admin = decoded;
  next();
};
