// routes/admin/messages.js — contact form inbox
import { Router } from 'express';
import { body } from 'express-validator';
import { validate, uuidParam } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import pool from '../../db.js';

const router = Router();
router.param('id', uuidParam);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.contact_messages ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
}));

router.patch('/:id', [body('is_read').isBoolean()], validate, asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('UPDATE public.contact_messages SET is_read = $1 WHERE id = $2', [req.body.is_read, req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Message not found.');
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.contact_messages WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Message not found.');
  res.json({ success: true });
}));

export default router;
