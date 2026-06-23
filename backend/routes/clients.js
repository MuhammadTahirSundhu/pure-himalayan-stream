// routes/clients.js — Public endpoint: fetch all active clients
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/clients — returns all active clients ordered by sort_order
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, logo_url, website_url FROM public.clients WHERE is_active = true ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[clients] GET error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch clients.' });
  }
});

export default router;
