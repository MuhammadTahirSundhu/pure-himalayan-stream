// routes/promo.js — OneWater Pakistan
// Public endpoint: POST /api/promo/validate

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import pool from '../db.js';

const router = Router();

/**
 * POST /api/promo/validate
 * Validates a promo code against the database.
 * Body: { code: string }
 * Returns: { valid: bool, discount_percentage: number, code: string }
 */
router.post(
  '/validate',
  [
    body('code').notEmpty().trim().toUpperCase().withMessage('Promo code is required'),
  ],
  validate,
  async (req, res) => {
    const { code } = req.body;
    try {
      const result = await pool.query(
        'SELECT code, discount_percentage FROM public.promo_codes WHERE UPPER(code) = $1 AND is_active = true',
        [code.toUpperCase()]
      );

      if (result.rows.length === 0) {
        return res.json({ valid: false, message: 'Invalid or expired promo code.' });
      }

      const promo = result.rows[0];
      res.json({
        valid: true,
        code: promo.code,
        discount_percentage: Number(promo.discount_percentage),
      });
    } catch (err) {
      console.error('[promo] POST /api/promo/validate error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to validate promo code.' });
    }
  }
);

export default router;
