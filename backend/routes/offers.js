// routes/offers.js — GET /api/offers
// Only offers whose promo code is live (active, not expired, not used up).
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import pool from '../db.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT o.id, o.title, o.description, o.original_price, o.sale_price, o.promo_code,
           o.discount_text, o.image_url, o.badge_text, o.color_gradient, o.icon_color,
           p.expires_at, p.min_order_amount
    FROM public.offers o
    LEFT JOIN public.promo_codes p ON UPPER(p.code) = UPPER(o.promo_code)
    WHERE o.is_active = true
      AND (o.promo_code IS NULL OR o.promo_code = ''
           OR (p.is_active AND (p.expires_at IS NULL OR p.expires_at > now())
               AND (p.max_uses IS NULL OR p.times_used < p.max_uses)))
    ORDER BY o.sort_order ASC, o.created_at DESC`);
  res.json(rows);
}));

export default router;
