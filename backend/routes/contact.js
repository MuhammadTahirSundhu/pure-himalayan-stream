// routes/contact.js — OneWater Pakistan
// Public endpoint: POST /api/contact

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import pool from '../db.js';

const router = Router();

/**
 * POST /api/contact
 * Saves a contact form submission to the database.
 * Body: { name, phone, email, message }
 */
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('message').notEmpty().trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('phone').optional().trim(),
  ],
  validate,
  async (req, res) => {
    const { name, phone, email, message } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO public.contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, phone || null, email, message]
      );
      console.log(`[contact] New message from: ${name} <${email}>`);
      res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error('[contact] POST /api/contact error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to send message.' });
    }
  }
);

export default router;
