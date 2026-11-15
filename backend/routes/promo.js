// routes/promo.js — POST /api/promo/validate
// Checks a code is usable. The discount itself is applied server-side when
// the order is priced (/api/orders/quote and /api/orders).

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { findUsablePromo } from '../lib/promo.js';
import pool from '../db.js';

const router = Router();

router.post(
  '/validate',
  [body('code').isString().trim().isLength({ min: 1, max: 40 }).withMessage('Promo code is required')],
  validate,
  asyncHandler(async (req, res) => {
    const { promo, error } = await findUsablePromo(pool, req.body.code);
    if (error) return res.json({ valid: false, message: error });
    res.json({
      valid: true,
      code: promo.code,
      discount_percentage: Number(promo.discount_percentage),
      min_order_amount: Number(promo.min_order_amount || 0),
    });
  })
);

export default router;
