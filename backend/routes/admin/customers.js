// routes/admin/customers.js — customers, bottle/deposit ledger, refill reminders
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate.js';
import { asyncHandler, withTransaction, HttpError } from '../../lib/asyncHandler.js';
import { normalizePkPhone, SCHEDULE_DAYS } from '../../lib/pricing.js';
import { getSettings } from '../../lib/settings.js';
import pool from '../../db.js';

const router = Router();

const phoneParam = (req) => {
  const phone = normalizePkPhone(req.params.phone);
  if (!phone) throw new HttpError(404, 'NotFound', 'Customer not found.');
  return phone;
};

/** GET /api/admin/customers?q=search */
router.get('/', asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const { rows } = await pool.query(
    `SELECT * FROM public.customers
     WHERE $1 = '' OR name ILIKE '%' || $1 || '%' OR phone LIKE '%' || $1 || '%' OR area ILIKE '%' || $1 || '%'
     ORDER BY last_order_at DESC NULLS LAST LIMIT 500`,
    [q]
  );
  const totals = await pool.query(`SELECT COALESCE(SUM(bottles_held),0)::int AS bottles, COALESCE(SUM(deposit_held),0) AS deposit, COUNT(*)::int AS customers FROM public.customers`);
  res.json({ customers: rows, totals: { ...totals.rows[0], deposit: Number(totals.rows[0].deposit) } });
}));

/**
 * GET /api/admin/customers/refills-due — repeat 19L customers whose next delivery
 * is due by tomorrow and who haven't ordered or been reminded since.
 */
router.get('/refills-due', asyncHandler(async (req, res) => {
  const cases = Object.entries(SCHEDULE_DAYS).map(([k, d]) => `WHEN '${k}' THEN ${d}`).join(' ');
  const { rows } = await pool.query(`
    SELECT c.*, (c.last_delivered_at + (CASE c.delivery_schedule ${cases} END) * interval '1 day') AS next_due
    FROM public.customers c
    WHERE c.delivery_schedule IN (${Object.keys(SCHEDULE_DAYS).map((k) => `'${k}'`).join(',')})
      AND c.last_delivered_at IS NOT NULL
      AND c.last_delivered_at + (CASE c.delivery_schedule ${cases} END) * interval '1 day' <= now() + interval '1 day'
      AND (c.last_order_at IS NULL OR c.last_order_at <= c.last_delivered_at)
      AND (c.last_reminded_at IS NULL OR c.last_reminded_at < c.last_delivered_at)
    ORDER BY next_due ASC`);
  res.json(rows);
}));

/** POST /api/admin/customers/:phone/reminded — marks a reminder as sent. */
router.post('/:phone/reminded', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('UPDATE public.customers SET last_reminded_at = now() WHERE phone = $1', [phoneParam(req)]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Customer not found.');
  res.json({ success: true });
}));

/** GET /api/admin/customers/:phone/bottles — ledger history */
router.get('/:phone/bottles', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.bottle_events WHERE phone = $1 ORDER BY created_at DESC LIMIT 200', [phoneParam(req)]);
  res.json(rows);
}));

/**
 * POST /api/admin/customers/:phone/bottles — { returned: n, refund: bool, note }
 * Records bottles handed back. With refund, the deposit for those bottles is paid out.
 */
router.post(
  '/:phone/bottles',
  [body('returned').isInt({ min: 1, max: 500 }), body('refund').isBoolean(), body('note').optional().isString().isLength({ max: 200 })],
  validate,
  asyncHandler(async (req, res) => {
    const phone = phoneParam(req);
    const { bottle_deposit } = (await getSettings()).delivery_info;
    const result = await withTransaction(pool, async (client) => {
      const { rows } = await client.query('SELECT bottles_held, deposit_held FROM public.customers WHERE phone = $1 FOR UPDATE', [phone]);
      if (!rows.length) throw new HttpError(404, 'NotFound', 'Customer not found.');
      const n = Math.min(req.body.returned, rows[0].bottles_held);
      if (n <= 0) throw new HttpError(409, 'NoBottles', 'This customer has no bottles on record.');
      const refund = req.body.refund ? Math.min(Number(rows[0].deposit_held), n * Number(bottle_deposit)) : 0;
      await client.query('UPDATE public.customers SET bottles_held = bottles_held - $2, deposit_held = deposit_held - $3 WHERE phone = $1', [phone, n, refund]);
      await client.query(
        'INSERT INTO public.bottle_events (phone, bottles_change, deposit_change, note) VALUES ($1,$2,$3,$4)',
        [phone, -n, -refund, req.body.note || (refund ? `Returned ${n}, deposit refunded` : `Returned ${n}`)]
      );
      return { returned: n, refunded: refund };
    });
    res.json({ success: true, ...result });
  })
);

/** PATCH /api/admin/customers/:phone — notes, schedule, credit adjustment */
router.patch(
  '/:phone',
  [
    body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 }),
    body('delivery_schedule').optional({ nullable: true }).isIn(['weekly', 'biweekly', 'monthly', null]),
    body('referral_credit').optional().isFloat({ min: 0, max: 100000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const fields = ['notes', 'delivery_schedule', 'referral_credit'].filter((f) => req.body[f] !== undefined);
    if (!fields.length) throw new HttpError(400, 'BadRequest', 'Nothing to update.');
    const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await pool.query(`UPDATE public.customers SET ${sets} WHERE phone = $1 RETURNING *`, [phoneParam(req), ...fields.map((f) => req.body[f])]);
    if (!rows.length) throw new HttpError(404, 'NotFound', 'Customer not found.');
    res.json(rows[0]);
  })
);

export default router;
