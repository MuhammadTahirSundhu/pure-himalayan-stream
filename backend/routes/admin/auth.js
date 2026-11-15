// routes/admin/auth.js — POST /api/admin/login
import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../../middleware/validate.js';
import { loginLimiter } from '../../middleware/rateLimiter.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import pool from '../../db.js';

const router = Router();
const INVALID = { error: 'InvalidCredentials', message: 'Incorrect username or password.' };

router.post(
  '/login',
  loginLimiter,
  [
    body('username').trim().isLength({ min: 1, max: 60 }).withMessage('Username is required'),
    body('password').isLength({ min: 1, max: 200 }).withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id, username, password_hash, token_version FROM public.admin_users WHERE LOWER(username) = $1',
      [username.toLowerCase()]
    );
    const admin = rows[0];
    // Same response for unknown user and wrong password (no user enumeration)
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json(INVALID);
    }
    const token = jwt.sign(
      { id: admin.id, username: admin.username, tv: admin.token_version },
      process.env.JWT_SECRET,
      { expiresIn: '1d', algorithm: 'HS256' }
    );
    console.log(`[admin/auth] '${admin.username}' logged in.`);
    res.json({ success: true, token, admin: { username: admin.username } });
  })
);

export default router;
