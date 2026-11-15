// routes/admin/offers.js — promotional offer cards
import { Router } from 'express';
import multer from 'multer';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import { uploadBuffer, imageFileFilter, IMAGE_FORMATS } from '../../lib/cloudinary.js';
import pool from '../../db.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: imageFileFilter });
const router = Router();

const uploadImage = (file) => uploadBuffer(file.buffer, {
  folder: 'onewater/offers', resource_type: 'image', allowed_formats: IMAGE_FORMATS,
  transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
});

const s = (v, max) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
const money = (v) => Math.max(0, Number(v) || 0);

/** Validates multipart form fields shared by create and update. */
const readOffer = (b) => {
  const offer = {
    title: s(b.title, 80), description: s(b.description, 400),
    original_price: money(b.original_price), sale_price: money(b.sale_price),
    promo_code: s(b.promo_code, 40).toUpperCase(), discount_text: s(b.discount_text, 30),
    badge_text: s(b.badge_text, 40), color_gradient: s(b.color_gradient, 80), icon_color: s(b.icon_color, 40),
    sort_order: Number.parseInt(b.sort_order, 10) || 0,
    is_active: b.is_active === undefined ? true : b.is_active === 'true' || b.is_active === true,
  };
  if (!offer.title || !offer.description || !offer.discount_text) {
    throw new HttpError(400, 'ValidationError', 'Title, description and discount text are required.');
  }
  return offer;
};

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.offers ORDER BY sort_order ASC, created_at DESC');
  res.json(rows);
}));

router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
  const o = readOffer(req.body);
  const image_url = req.file ? await uploadImage(req.file) : null;
  const id = /^[a-z0-9-]{1,60}$/i.test(req.body.id || '') ? req.body.id : `offer-${Date.now()}`;
  const { rows } = await pool.query(
    `INSERT INTO public.offers (id, title, description, original_price, sale_price, promo_code, discount_text,
       badge_text, color_gradient, icon_color, sort_order, is_active, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [id, o.title, o.description, o.original_price, o.sale_price, o.promo_code, o.discount_text,
      o.badge_text, o.color_gradient, o.icon_color, o.sort_order, o.is_active, image_url]
  );
  res.status(201).json(rows[0]);
}));

router.put('/:id', upload.single('image'), asyncHandler(async (req, res) => {
  const o = readOffer(req.body);
  // Image: new upload > explicit removal > keep existing
  const newImage = req.file ? await uploadImage(req.file) : null;
  const { rows } = await pool.query(
    `UPDATE public.offers SET title=$1, description=$2, original_price=$3, sale_price=$4, promo_code=$5,
       discount_text=$6, badge_text=$7, color_gradient=$8, icon_color=$9, sort_order=$10, is_active=$11,
       image_url = CASE WHEN $12::text IS NOT NULL THEN $12 WHEN $13 THEN NULL ELSE image_url END
     WHERE id = $14 RETURNING *`,
    [o.title, o.description, o.original_price, o.sale_price, o.promo_code, o.discount_text, o.badge_text,
      o.color_gradient, o.icon_color, o.sort_order, o.is_active, newImage, req.body.remove_image === 'true', req.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'NotFound', 'Offer not found.');
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.offers WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Offer not found.');
  res.json({ success: true });
}));

export default router;
