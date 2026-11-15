// routes/admin/stats.js — dashboard numbers
import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import pool from '../../db.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const [orders, today, inbox] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')  AS confirmed,
        COUNT(*) FILTER (WHERE status = 'dispatched') AS dispatched,
        COUNT(*) FILTER (WHERE status = 'delivered')  AS delivered,
        COUNT(*) FILTER (WHERE status = 'rejected')   AS rejected,
        COUNT(*) AS total,
        -- revenue = water sold on delivered orders (excludes refundable deposits)
        COALESCE(SUM(total - deposit_total) FILTER (WHERE status = 'delivered'), 0) AS total_revenue
      FROM public.orders`),
    pool.query(`
      SELECT COUNT(*) AS orders,
             COALESCE(SUM(total - deposit_total) FILTER (WHERE status <> 'rejected'), 0) AS revenue
      FROM public.orders WHERE created_at >= CURRENT_DATE`),
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM public.contact_messages WHERE NOT is_read) AS unread_messages,
        (SELECT COUNT(*) FROM public.event_inquiries WHERE status = 'new') AS new_inquiries,
        (SELECT COUNT(*) FROM public.city_waitlist) AS waitlist,
        (SELECT COUNT(*) FROM public.customers c WHERE c.delivery_schedule IN ('weekly','biweekly','monthly') AND c.last_delivered_at IS NOT NULL
           AND c.last_delivered_at + (CASE c.delivery_schedule WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE 30 END) * interval '1 day' <= now() + interval '1 day'
           AND (c.last_order_at IS NULL OR c.last_order_at <= c.last_delivered_at)
           AND (c.last_reminded_at IS NULL OR c.last_reminded_at < c.last_delivered_at)) AS refills_due,
        (SELECT COUNT(*) FROM public.customers) AS customers,
        (SELECT COALESCE(SUM(bottles_held),0) FROM public.customers) AS bottles_out`),
  ]);
  const o = orders.rows[0];
  const n = (v) => Number(v);
  res.json({
    orders: {
      total: n(o.total), pending: n(o.pending), confirmed: n(o.confirmed), dispatched: n(o.dispatched),
      delivered: n(o.delivered), rejected: n(o.rejected), total_revenue: n(o.total_revenue),
    },
    today: { orders: n(today.rows[0].orders), revenue: n(today.rows[0].revenue) },
    messages: n(inbox.rows[0].unread_messages),
    new_inquiries: n(inbox.rows[0].new_inquiries),
    waitlist: n(inbox.rows[0].waitlist),
    refills_due: n(inbox.rows[0].refills_due),
    customers: n(inbox.rows[0].customers),
    bottles_out: n(inbox.rows[0].bottles_out),
  });
}));

export default router;
