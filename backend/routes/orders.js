// routes/orders.js — OneWater Pakistan
// Public endpoints: POST /api/orders/screenshot, POST /api/orders
//
// The client sends WHAT it wants (product ids, quantities, new 19L bottles).
// Every price, deposit, discount and total is computed here from the database.

import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import crypto from 'crypto';
import { validate } from '../middleware/validate.js';
import { orderLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, withTransaction, HttpError } from '../lib/asyncHandler.js';
import { uploadBuffer, isOwnCloudinaryUrl, imageFileFilter, IMAGE_FORMATS } from '../lib/cloudinary.js';
import { priceOrder, normalizePkPhone } from '../lib/pricing.js';
import { findUsablePromo } from '../lib/promo.js';
import { getSettings, activePaymentAccounts, isServiceCity } from '../lib/settings.js';
import pool from '../db.js';

const router = Router();
const SCREENSHOT_FOLDER = 'onewater/screenshots';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
});

/** POST /api/orders/screenshot — uploads a payment screenshot, returns its URL. */
router.post('/screenshot', uploadLimiter, upload.single('screenshot'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'NoFile', 'Please attach your payment screenshot.');
  const url = await uploadBuffer(req.file.buffer, {
    folder: SCREENSHOT_FOLDER,
    resource_type: 'image',
    allowed_formats: IMAGE_FORMATS,
  });
  res.json({ success: true, url });
}));

const makeOrderRef = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `OW-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

/** POST /api/orders/quote — prices a cart without placing it (used by checkout). */
router.post(
  '/quote',
  [
    body('items').isArray({ min: 1, max: 30 }),
    body('items.*.id').isString().isLength({ min: 1, max: 60 }),
    body('items.*.quantity').isInt({ min: 1, max: 1000 }),
    body('items.*.new_bottles').optional().isInt({ min: 0, max: 1000 }),
    body('promo_code').optional({ values: 'falsy' }).isString().isLength({ max: 40 }),
    body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const { rows } = await pool.query('SELECT id, name, price, category, in_stock FROM public.products');
    const products = new Map(rows.map((p) => [p.id, p]));
    let promo = null;
    let promo_error = null;
    if (req.body.promo_code) {
      const r = await findUsablePromo(pool, req.body.promo_code, { phone: req.body.phone });
      promo = r.promo || null;
      promo_error = r.error || null;
    }
    try {
      const quote = priceOrder({ items: req.body.items, products, delivery: settings.delivery_info, promo });
      res.json({ ...quote, promo_code: promo?.code || null, promo_error });
    } catch (err) {
      if (err.code === 'PromoMinimum') {
        const quote = priceOrder({ items: req.body.items, products, delivery: settings.delivery_info });
        return res.json({ ...quote, promo_code: null, promo_error: err.message });
      }
      if (err.code) throw new HttpError(400, err.code, err.message);
      throw err;
    }
  })
);

/** POST /api/orders — places an order. */
router.post(
  '/',
  orderLimiter,
  [
    body('customer_name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your full name.'),
    body('phone').trim().custom((v) => normalizePkPhone(v) !== null).withMessage('Please enter a valid Pakistani phone number, e.g. 0300 1234567.'),
    body('city').trim().isLength({ min: 2, max: 60 }).withMessage('City is required.'),
    body('area').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
    body('street').trim().isLength({ min: 3, max: 200 }).withMessage('Please enter your street address.'),
    body('payment_method').isString().isLength({ min: 2, max: 20 }),
    body('promo_code').optional({ values: 'falsy' }).isString().isLength({ max: 40 }),
    body('delivery_schedule').optional({ values: 'falsy' }).isIn(['once', 'weekly', 'biweekly', 'monthly']),
    body('customer_note').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
    body('screenshot_url').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
    body('items').isArray({ min: 1, max: 30 }).withMessage('Your cart is empty.'),
    body('items.*.id').isString().isLength({ min: 1, max: 60 }),
    body('items.*.quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be between 1 and 1000.'),
    body('items.*.new_bottles').optional().isInt({ min: 0, max: 1000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { customer_name, city, area, street, payment_method, items, screenshot_url, delivery_schedule, customer_note } = req.body;
    const phone = normalizePkPhone(req.body.phone);
    const settings = await getSettings();

    if (!isServiceCity(settings, city)) {
      throw new HttpError(422, 'OutsideServiceArea',
        `We currently deliver in ${settings.service_areas.cities.join(', ')} only. Join our waitlist and we'll tell you when we reach ${city}.`);
    }

    const accounts = activePaymentAccounts(settings);
    if (payment_method !== 'cod') {
      if (!accounts.some((a) => a.id === payment_method)) {
        throw new HttpError(422, 'InvalidPaymentMethod', 'Please choose an available payment method.');
      }
      if (!isOwnCloudinaryUrl(screenshot_url, SCREENSHOT_FOLDER)) {
        throw new HttpError(422, 'ScreenshotRequired', 'Please upload your payment screenshot.');
      }
    }

    const order = await withTransaction(pool, async (client) => {
      const ids = [...new Set(items.map((i) => String(i.id)))];
      const { rows } = await client.query(
        'SELECT id, name, price, category, in_stock FROM public.products WHERE id = ANY($1)',
        [ids]
      );
      const products = new Map(rows.map((p) => [p.id, p]));

      let promo = null;
      if (req.body.promo_code) {
        const r = await findUsablePromo(client, req.body.promo_code, { phone, lock: true });
        if (r.error) throw new HttpError(422, 'InvalidPromo', r.error);
        promo = r.promo;
      }

      let priced;
      try {
        priced = priceOrder({ items, products, delivery: settings.delivery_info, promo });
      } catch (err) {
        if (err.code) throw new HttpError(422, err.code, err.message);
        throw err;
      }

      const hasDispenser = priced.lines.some((l) => products.get(l.product_id)?.category === 'dispenser');
      const order_ref = makeOrderRef();
      const { rows: [created] } = await client.query(
        `INSERT INTO public.orders
          (order_ref, customer_name, phone, city, area, street, payment_method,
           subtotal, deposit_total, discount, delivery_fee, total, promo_code,
           delivery_schedule, customer_note, screenshot_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING id, order_ref`,
        [order_ref, customer_name, phone, city.trim(), area || null, street, payment_method,
          priced.subtotal, priced.deposit_total, priced.discount, priced.delivery_fee, priced.total,
          promo?.code || null, hasDispenser ? delivery_schedule || 'once' : null, customer_note || null,
          payment_method === 'cod' ? null : screenshot_url]
      );

      for (const l of priced.lines) {
        await client.query(
          `INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price_at_time, new_bottles, deposit_at_time)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [created.id, l.product_id, l.product_name, l.quantity, l.unit_price, l.new_bottles, l.deposit]
        );
      }
      if (promo) {
        await client.query('UPDATE public.promo_codes SET times_used = times_used + 1 WHERE id = $1', [promo.id]);
      }
      return { ...created, ...priced };
    });

    console.log(`[orders] New order ${order.order_ref} | PKR ${order.total}`);
    res.status(201).json({
      success: true,
      order_ref: order.order_ref,
      subtotal: order.subtotal,
      deposit_total: order.deposit_total,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
      total: order.total,
    });
  })
);

export default router;
