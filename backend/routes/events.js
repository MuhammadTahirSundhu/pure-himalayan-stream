// routes/events.js — OneWater Pakistan
// Public endpoint: POST /api/events

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import pool from '../db.js';

const router = Router();

/**
 * POST /api/events
 * Saves an event inquiry form submission.
 */
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('phone').notEmpty().trim().withMessage('Phone is required'),
    body('email').optional().trim(),
    body('event_date').optional().trim(),
    body('event_location').optional().trim(),
    body('bottle_size').optional().trim(),
    body('quantity').optional().trim(),
    body('notes').optional().trim(),
  ],
  validate,
  async (req, res) => {
    const { name, phone, email, event_date, event_location, bottle_size, quantity, notes } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO public.event_inquiries (name, phone, email, event_date, event_location, bottle_size, quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [name, phone, email || null, event_date || null, event_location || null, bottle_size || null, quantity || null, notes || null]
      );
      console.log(`[events] New inquiry from: ${name} <${phone}>`);
      res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error('[events] POST /api/events error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to submit inquiry.' });
    }
  }
);

export default router;
