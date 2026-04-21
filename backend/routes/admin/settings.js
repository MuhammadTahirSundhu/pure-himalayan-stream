// routes/admin/settings.js — OneWater Pakistan
// GET/PUT /api/admin/settings and PUT /api/admin/password

import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { validate } from '../../middleware/validate.js';
import pool from '../../db.js';

const router = Router();

/**
 * GET /api/admin/settings
 * Returns all key-value site settings (payment accounts, contact info, etc.)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM public.site_settings');
    // Convert rows array to a { key: value } object for easy frontend consumption
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('[admin/settings] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch settings.' });
  }
});

/**
 * PUT /api/admin/settings
 * Upserts one or more settings key-value pairs.
 * Body: { settings: { key: value, ... } }
 */
router.put(
  '/',
  [
    body('settings').isObject().withMessage('Settings must be an object'),
  ],
  validate,
  async (req, res) => {
    const { settings } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          `INSERT INTO public.site_settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query('COMMIT');
      console.log('[admin/settings] Settings updated');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[admin/settings] PUT error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to update settings.' });
    } finally {
      client.release();
    }
  }
);

/**
 * PUT /api/admin/password
 * Changes the admin password. Requires current password verification.
 * Body: { current_password, new_password }
 */
router.put(
  '/password',
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  async (req, res) => {
    const { current_password, new_password } = req.body;
    const adminId = req.admin.id; // Set by authMiddleware

    try {
      const result = await pool.query(
        'SELECT password_hash FROM public.admin_users WHERE id = $1',
        [adminId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NotFound', message: 'Admin user not found.' });
      }

      const isValid = await bcrypt.compare(current_password, result.rows[0].password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'InvalidCredentials', message: 'Current password is incorrect.' });
      }

      const newHash = await bcrypt.hash(new_password, 12);
      await pool.query(
        'UPDATE public.admin_users SET password_hash = $1 WHERE id = $2',
        [newHash, adminId]
      );

      console.log(`[admin/settings] Password changed for admin ${adminId}`);
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      console.error('[admin/settings] PUT /password error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to update password.' });
    }
  }
);

export default router;
