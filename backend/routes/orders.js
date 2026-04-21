// routes/orders.js — OneWater Pakistan
// Public endpoint: POST /api/orders, POST /api/orders/screenshot

import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { validate } from '../middleware/validate.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import pool from '../db.js';

const router = Router();

// ── Cloudinary Configuration ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use multer memoryStorage — file stays in RAM, we stream to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

/**
 * POST /api/orders/screenshot
 * Uploads a payment screenshot directly to Cloudinary and returns the secure URL.
 */
router.post('/screenshot', orderLimiter, upload.single('screenshot'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'NoFile', message: 'Please provide an image file.' });
  }

  try {
    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'onewater/screenshots',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    console.log(`[orders/screenshot] Uploaded to Cloudinary: ${result.secure_url}`);
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('[orders/screenshot] Cloudinary upload error:', err.message);
    res.status(500).json({ error: 'UploadError', message: 'Failed to upload screenshot.' });
  }
});

/**
 * POST /api/orders
 * Submits a new order with its items inside a DB transaction.
 * Body: { order_ref, customer_name, phone, city, area, street, payment_method, total, items[], screenshot_url }
 */
router.post(
  '/',
  orderLimiter,
  [
    body('order_ref').notEmpty().withMessage('Order reference is required'),
    body('customer_name').notEmpty().trim().withMessage('Customer name is required'),
    body('phone').notEmpty().trim().withMessage('Phone number is required'),
    body('city').notEmpty().trim().withMessage('City is required'),
    body('street').notEmpty().trim().withMessage('Street address is required'),
    body('payment_method').notEmpty().withMessage('Payment method is required'),
    body('total').isNumeric().withMessage('Total must be a number'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.id').notEmpty().withMessage('Each item must have a product ID'),
    body('items.*.name').notEmpty().withMessage('Each item must have a name'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('items.*.price').isNumeric().withMessage('Item price must be a number'),
  ],
  validate,
  async (req, res) => {
    const { order_ref, customer_name, phone, city, area, street, payment_method, total, items, screenshot_url } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO public.orders 
         (order_ref, customer_name, phone, city, area, street, payment_method, total, screenshot_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [order_ref, customer_name, phone, city, area || null, street, payment_method, total, screenshot_url || null]
      );

      const orderId = orderResult.rows[0].id;

      // Insert items — product_id is stored as plain text reference (no FK constraint dependency)
      for (const item of items) {
        await client.query(
          `INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price_at_time) 
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, String(item.id), String(item.name), parseInt(item.quantity), parseFloat(item.price)]
        );
      }

      await client.query('COMMIT');
      console.log(`[orders] New order placed: ${order_ref} | Customer: ${customer_name} | Total: PKR ${total}`);
      res.status(201).json({ success: true, orderId, order_ref });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[orders] POST /api/orders error:', err.message, err.stack);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'DuplicateOrder', message: 'An order with this reference already exists.' });
      }
      res.status(500).json({ error: 'ServerError', message: 'Failed to submit order.', detail: err.message });
    } finally {
      client.release();
    }
  }
);

export default router;
