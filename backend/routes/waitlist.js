// routes/waitlist.js — POST /api/waitlist ("Bring One Water to my city")
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { normalizePkPhone } from '../lib/pricing.js';
import pool from '../db.js';

const router = Router();

router.post(
  '/',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your name.'),
    body('phone').trim().custom((v) => normalizePkPhone(v) !== null).withMessage('Please enter a valid phone number.'),
    body('city').trim().isLength({ min: 2, max: 60 }).withMessage('Please enter your city.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    await pool.query(
      'INSERT INTO public.city_waitlist (name, phone, city) VALUES ($1, $2, $3)',
      [req.body.name, normalizePkPhone(req.body.phone), req.body.city]
    );
    res.status(201).json({ success: true });
  })
);

export default router;
