// routes/products.js — OneWater Pakistan
// Public endpoint: GET /api/products

import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/**
 * GET /api/products
 * Returns all in-stock and out-of-stock products ordered by price ASC.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.products ORDER BY price ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[products] GET /api/products error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch products.' });
  }
});

export default router;
