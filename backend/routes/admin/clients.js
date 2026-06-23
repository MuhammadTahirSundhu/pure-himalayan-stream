// routes/admin/clients.js — Protected admin endpoints for managing clients
import express from 'express';
import pool from '../../db.js';

const router = express.Router();

// GET /api/admin/clients — list all clients (including inactive)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.clients ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/clients] GET error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch clients.' });
  }
});

// POST /api/admin/clients — add a new client
router.post('/', async (req, res) => {
  const { name, logo_url, website_url, sort_order } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Client name is required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO public.clients (name, logo_url, website_url, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), logo_url || null, website_url || null, sort_order ?? 0]
    );
    res.status(201).json({ client: result.rows[0] });
  } catch (err) {
    console.error('[admin/clients] POST error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to create client.' });
  }
});

// PATCH /api/admin/clients/:id/toggle — toggle is_active
router.patch('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.clients SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    res.json({ client: result.rows[0] });
  } catch (err) {
    console.error('[admin/clients] PATCH toggle error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to toggle client.' });
  }
});

// DELETE /api/admin/clients/:id — delete a client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.clients WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[admin/clients] DELETE error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete client.' });
  }
});

export default router;
