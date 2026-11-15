// routes/admin/orders.js — order management (JWT-protected)
import { Router } from 'express';
import { body } from 'express-validator';
import { validate, uuidParam } from '../../middleware/validate.js';
import { asyncHandler, withTransaction, HttpError } from '../../lib/asyncHandler.js';
import { applyDelivered, applyRejected } from '../../lib/customers.js';
import { getSettings } from '../../lib/settings.js';
import { canTransition } from '../../lib/pricing.js';
import pool from '../../db.js';

const router = Router();
router.param('id', uuidParam);

const ORDER_SELECT = `
  SELECT o.*,
    COALESCE(json_agg(json_build_object(
      'product_id', oi.product_id, 'name', oi.product_name, 'quantity', oi.quantity,
      'price', oi.price_at_time, 'new_bottles', oi.new_bottles, 'deposit', oi.deposit_at_time
    ) ORDER BY oi.product_name) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id`;

/** GET /api/admin/orders?status=pending */
router.get('/', asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  const { rows } = await pool.query(
    `${ORDER_SELECT} ${status ? 'WHERE o.status = $1' : ''} GROUP BY o.id ORDER BY o.created_at DESC LIMIT 500`,
    status ? [status] : []
  );
  res.json(rows);
}));

/** PUT /api/admin/orders/:id/status — enforces the order lifecycle. */
router.put(
  '/:id/status',
  [
    body('status').isIn(['pending', 'confirmed', 'dispatched', 'delivered', 'rejected']).withMessage('Invalid status value'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    // notes: undefined = keep, '' = clear, string = replace
    const notes = req.body.notes === undefined ? undefined : (req.body.notes || null);
    const settings = await getSettings();
    await withTransaction(pool, async (client) => {
      const { rows } = await client.query('SELECT * FROM public.orders WHERE id = $1 FOR UPDATE', [req.params.id]);
      if (!rows.length) throw new HttpError(404, 'NotFound', 'Order not found.');
      const order = rows[0];
      if (!canTransition(order.status, status)) {
        throw new HttpError(409, 'InvalidTransition', `An order that is ${order.status} cannot be marked ${status}.`);
      }
      await client.query(
        `UPDATE public.orders
           SET status = $1, status_updated_at = CASE WHEN status <> $1 THEN now() ELSE status_updated_at END,
               notes = CASE WHEN $3 THEN $2 ELSE notes END
         WHERE id = $4`,
        [status, notes ?? null, notes !== undefined, order.id]
      );
      if (order.status !== status && status === 'delivered') await applyDelivered(client, order, settings.referral);
      if (order.status !== status && status === 'rejected') await applyRejected(client, order);
    });
    res.json({ success: true, id: req.params.id, status });
  })
);

export default router;
