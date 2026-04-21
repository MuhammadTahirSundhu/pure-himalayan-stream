import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDB } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Auto-Initialization ---
initDB().catch(console.error);

// --- Endpoints ---

// 1. Get Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.products ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, phone, email, message]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Submit Order
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, city, area, street, payment_method, total, items, order_ref } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert order
    const orderResult = await client.query(
      `INSERT INTO public.orders 
       (order_ref, customer_name, phone, city, area, street, payment_method, total) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [order_ref, customer_name, phone, city, area, street, payment_method, total]
    );
    
    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price_at_time) 
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id, item.name, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 4. Admin Get Orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    // Fetch orders with items as JSON array
    const result = await pool.query(`
      SELECT o.*, 
        COALESCE(
          json_agg(
            json_build_object('name', oi.product_name, 'quantity', oi.quantity)
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Update Order Status
app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server strictly running on http://localhost:${PORT}`);
});
