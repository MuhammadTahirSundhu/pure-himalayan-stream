import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all active offers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.offers WHERE is_active = true ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ message: 'Server error fetching offers' });
  }
});

export default router;
