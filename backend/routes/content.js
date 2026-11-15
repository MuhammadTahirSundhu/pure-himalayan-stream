// routes/content.js — public reviews and gallery (only active items)
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import pool from '../db.js';

const router = Router();

router.get('/testimonials', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, area, text, rating, source FROM public.testimonials WHERE is_active ORDER BY sort_order ASC, created_at DESC LIMIT 30');
  res.set('Cache-Control', 'public, max-age=300').json(rows);
}));

router.get('/gallery', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, image_url, caption FROM public.gallery WHERE is_active ORDER BY sort_order ASC, created_at DESC LIMIT 40');
  res.set('Cache-Control', 'public, max-age=300').json(rows);
}));

export default router;
