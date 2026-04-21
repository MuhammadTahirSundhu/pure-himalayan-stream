// routes/admin/stats.js — OneWater Pakistan
// GET /api/admin/stats — Dashboard statistics

import { Router } from 'express';
import pool from '../../db.js';

const router = Router();

/**
 * GET /api/admin/stats
 * Returns aggregated stats for the admin dashboard.
 * Includes: order counts by status, today's revenue, total revenue, message count.
 */
router.get('/', async (req, res) => {
  try {
    const [ordersStats, todayOrders, messages] = await Promise.all([
      // Total orders grouped by status
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
          COUNT(*) FILTER (WHERE status = 'confirmed')  AS confirmed,
          COUNT(*) FILTER (WHERE status = 'dispatched') AS dispatched,
          COUNT(*) FILTER (WHERE status = 'delivered')  AS delivered,
          COUNT(*) FILTER (WHERE status = 'rejected')   AS rejected,
          COUNT(*) AS total,
          COALESCE(SUM(total) FILTER (WHERE status != 'rejected'), 0) AS total_revenue
        FROM public.orders
      `),
      // Today's orders + revenue
      pool.query(`
        SELECT 
          COUNT(*) AS today_orders,
          COALESCE(SUM(total) FILTER (WHERE status != 'rejected'), 0) AS today_revenue
        FROM public.orders
        WHERE created_at >= CURRENT_DATE
      `),
      // Unread messages count (all for now)
      pool.query('SELECT COUNT(*) AS count FROM public.contact_messages'),
    ]);

    const stats = ordersStats.rows[0];
    const today = todayOrders.rows[0];

    res.json({
      orders: {
        total: Number(stats.total),
        pending: Number(stats.pending),
        confirmed: Number(stats.confirmed),
        dispatched: Number(stats.dispatched),
        delivered: Number(stats.delivered),
        rejected: Number(stats.rejected),
        total_revenue: Number(stats.total_revenue),
      },
      today: {
        orders: Number(today.today_orders),
        revenue: Number(today.today_revenue),
      },
      messages: Number(messages.rows[0].count),
    });
  } catch (err) {
    console.error('[admin/stats] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch stats.' });
  }
});

export default router;
