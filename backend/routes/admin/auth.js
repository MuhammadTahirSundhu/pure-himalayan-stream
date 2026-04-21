// routes/admin/auth.js — OneWater Pakistan
// POST /api/admin/login

import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../../middleware/validate.js';
import { loginLimiter } from '../../middleware/rateLimiter.js';
import pool from '../../db.js';

const router = Router();

/**
 * POST /api/admin/login
 * Authenticates the admin user and returns a signed JWT (7 day expiry).
 * Body: { username, password }
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('username').notEmpty().trim().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query(
        'SELECT * FROM public.admin_users WHERE username = $1',
        [username.toLowerCase()]
      );

      if (result.rows.length === 0) {
        // Use same message to avoid username enumeration
        return res.status(401).json({ error: 'InvalidCredentials', message: 'Incorrect username or password.' });
      }

      const admin = result.rows[0];
      const isValid = await bcrypt.compare(password, admin.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'InvalidCredentials', message: 'Incorrect username or password.' });
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`[admin/auth] Admin '${admin.username}' logged in.`);
      res.json({ 
        success: true, 
        token,
        admin: { username: admin.username }
      });
    } catch (err) {
      console.error('[admin/auth] POST /api/admin/login error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Login failed. Please try again.' });
    }
  }
);

export default router;
