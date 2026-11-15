// routes/events.js — POST /api/events (event / bulk order inquiries)
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { normalizePkPhone } from '../lib/pricing.js';
import { notifyOwner } from '../lib/notify.js';
import pool from '../db.js';

const router = Router();
const opt = (field, max) => body(field).optional({ values: 'falsy' }).trim().isLength({ max });

router.post(
  '/',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your name.'),
    body('phone').trim().custom((v) => normalizePkPhone(v) !== null).withMessage('Please enter a valid phone number.'),
    body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Please enter a valid email.'),
    opt('event_type', 40), opt('event_date', 40), opt('event_location', 120),
    opt('bottle_size', 40), opt('quantity', 20), opt('notes', 1000),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
      `INSERT INTO public.event_inquiries (name, phone, email, event_type, event_date, event_location, bottle_size, quantity, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [b.name, normalizePkPhone(b.phone), b.email || null, b.event_type || null, b.event_date || null,
        b.event_location || null, b.bottle_size || null, b.quantity || null, b.notes || null]
    );
    notifyOwner(`🎉 Bulk/event inquiry from ${b.name} · ${normalizePkPhone(b.phone)}\n${[b.event_type, b.event_date, b.event_location, b.quantity && `${b.quantity} × ${b.bottle_size || 'bottles'}`].filter(Boolean).join(' · ')}${b.notes ? `\n📝 ${b.notes}` : ''}`);
    res.status(201).json({ success: true, id: rows[0].id });
  })
);

export default router;
