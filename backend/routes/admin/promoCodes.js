// routes/admin/promoCodes.js — OneWater Pakistan
// Full CRUD for promo codes

import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middleware/validate.js';
import pool from '../../db.js';

const router = Router();

/**
 * GET /api/admin/promo-codes
 * Returns all promo codes (active and inactive).
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.promo_codes ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/promo-codes] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch promo codes.' });
  }
});

/**
 * POST /api/admin/promo-codes
 * Creates a new promo code.
 * Body: { code, discount_percentage, is_active? }
 */
router.post(
  '/',
  [
    body('code').notEmpty().trim().toUpperCase().withMessage('Code is required'),
    body('discount_percentage')
      .isNumeric()
      .custom(v => v > 0 && v <= 100).withMessage('Discount must be between 1 and 100'),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    const { code, discount_percentage, is_active = true } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO public.promo_codes (code, discount_percentage, is_active) VALUES ($1, $2, $3) RETURNING *',
        [code.toUpperCase(), discount_percentage, is_active]
      );
      console.log(`[admin/promo-codes] Created promo: ${code}`);
      res.status(201).json({ success: true, promo: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Duplicate', message: 'A promo code with this name already exists.' });
      }
      console.error('[admin/promo-codes] POST error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to create promo code.' });
    }
  }
);

/**
 * PATCH /api/admin/promo-codes/:id/toggle
 * Toggles a promo code's is_active status.
 */
router.patch('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.promo_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Promo code not found.' });
    }
    res.json({ success: true, promo: result.rows[0] });
  } catch (err) {
    console.error('[admin/promo-codes] PATCH toggle error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to toggle promo code.' });
  }
});

/**
 * DELETE /api/admin/promo-codes/:id
 * Permanently deletes a promo code.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM public.promo_codes WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Promo code not found.' });
    }
    console.log(`[admin/promo-codes] Deleted promo: ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('[admin/promo-codes] DELETE error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to delete promo code.' });
  }
});

export default router;
