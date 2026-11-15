// routes/admin/promoCodes.js — promo code management
import { Router } from 'express';
import { body } from 'express-validator';
import { validate, uuidParam } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import pool from '../../db.js';

const router = Router();
router.param('id', uuidParam);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.promo_codes ORDER BY created_at DESC');
  res.json(rows);
}));

router.post(
  '/',
  [
    body('code').trim().toUpperCase().matches(/^[A-Z0-9_-]{3,30}$/).withMessage('Code: 3–30 letters, numbers, - or _'),
    body('discount_percentage').isFloat({ gt: 0, max: 100 }).withMessage('Discount must be between 1 and 100'),
    body('is_active').optional().isBoolean(),
    body('expires_at').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid expiry date'),
    body('max_uses').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Max uses must be 1 or more'),
    body('min_order_amount').optional({ values: 'falsy' }).isFloat({ min: 0 }),
    body('once_per_customer').optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const b = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO public.promo_codes (code, discount_percentage, is_active, expires_at, max_uses, min_order_amount, once_per_customer)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [b.code, b.discount_percentage, b.is_active ?? true, b.expires_at || null, b.max_uses || null,
          b.min_order_amount || 0, Boolean(b.once_per_customer)]
      );
      res.status(201).json({ success: true, promo: rows[0] });
    } catch (err) {
      if (err.code === '23505') throw new HttpError(409, 'Duplicate', 'A promo code with this name already exists.');
      throw err;
    }
  })
);

router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('UPDATE public.promo_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'NotFound', 'Promo code not found.');
  res.json({ success: true, promo: rows[0] });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.promo_codes WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Promo code not found.');
  res.json({ success: true });
}));

export default router;
