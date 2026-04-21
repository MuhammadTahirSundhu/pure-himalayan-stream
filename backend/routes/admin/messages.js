// routes/admin/messages.js — OneWater Pakistan
// GET /api/admin/messages — View contact form submissions

import { Router } from 'express';
import pool from '../../db.js';

const router = Router();

/**
 * GET /api/admin/messages
 * Returns all contact form messages, newest first.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.contact_messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/messages] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch messages.' });
  }
});

export default router;
