// routes/admin/inquiries.js — event/bulk leads and the city waitlist
import { Router } from 'express';
import { body } from 'express-validator';
import { validate, uuidParam } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import pool from '../../db.js';

const router = Router();
router.param('id', uuidParam);

router.get('/events', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.event_inquiries ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
}));

router.patch('/events/:id', [body('status').isIn(['new', 'contacted', 'won', 'lost'])], validate, asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('UPDATE public.event_inquiries SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Inquiry not found.');
  res.json({ success: true });
}));

router.delete('/events/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.event_inquiries WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Inquiry not found.');
  res.json({ success: true });
}));

/** Waitlist grouped by city — tells the business where to expand next. */
router.get('/waitlist', asyncHandler(async (req, res) => {
  const [list, byCity] = await Promise.all([
    pool.query('SELECT * FROM public.city_waitlist ORDER BY created_at DESC LIMIT 1000'),
    pool.query(`SELECT INITCAP(TRIM(city)) AS city, COUNT(*)::int AS count FROM public.city_waitlist GROUP BY 1 ORDER BY 2 DESC`),
  ]);
  res.json({ entries: list.rows, by_city: byCity.rows });
}));

router.delete('/waitlist/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.city_waitlist WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Entry not found.');
  res.json({ success: true });
}));

export default router;
