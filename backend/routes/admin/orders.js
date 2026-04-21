// routes/admin/orders.js — OneWater Pakistan
// Admin order management endpoints (all JWT-protected)

import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middleware/validate.js';
import pool from '../../db.js';

const router = Router();

/**
 * GET /api/admin/orders
 * Returns all orders with their items joined as a JSON array.
 * Ordered by most recent first.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.price_at_time
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/orders] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch orders.' });
  }
});

/**
 * GET /api/admin/orders/:id
 * Returns a single order's full detail with items.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.price_at_time
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Order not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/orders] GET /:id error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch order.' });
  }
});

/**
 * PUT /api/admin/orders/:id/status
 * Updates the status of an order.
 * Body: { status: string, notes?: string }
 */
router.put(
  '/:id/status',
  [
    param('id').notEmpty(),
    body('status')
      .isIn(['pending', 'confirmed', 'dispatched', 'delivered', 'rejected'])
      .withMessage('Invalid status value'),
  ],
  validate,
  async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    try {
      const result = await pool.query(
        'UPDATE public.orders SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING id, status',
        [status, notes || null, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NotFound', message: 'Order not found.' });
      }
      console.log(`[admin/orders] Order ${id} → status: ${status}`);
      res.json({ success: true, id, status });
    } catch (err) {
      console.error('[admin/orders] PUT /:id/status error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to update order status.' });
    }
  }
);

export default router;
