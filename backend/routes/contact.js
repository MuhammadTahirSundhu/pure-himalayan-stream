// routes/contact.js — POST /api/contact
// Phone-first: most customers reply on WhatsApp, so phone OR email is enough.
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, HttpError } from '../lib/asyncHandler.js';
import { normalizePkPhone } from '../lib/pricing.js';
import pool from '../db.js';

const router = Router();

router.post(
  '/',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your name.'),
    body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Please enter a valid email.').isLength({ max: 120 }),
    body('phone').optional({ values: 'falsy' }).trim().custom((v) => normalizePkPhone(v) !== null).withMessage('Please enter a valid phone number.'),
    body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Please write a short message (5+ characters).'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    const phone = req.body.phone ? normalizePkPhone(req.body.phone) : null;
    if (!phone && !email) throw new HttpError(422, 'ContactRequired', 'Please give us a phone number or email so we can reply.');
    const { rows } = await pool.query(
      'INSERT INTO public.contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, phone, email || null, message]
    );
    res.status(201).json({ success: true, id: rows[0].id });
  })
);

export default router;
