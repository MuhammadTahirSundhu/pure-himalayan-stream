// routes/admin/content.js — real customer reviews and plant/team photos
import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { validate, uuidParam } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import { uploadBuffer, imageFileFilter, IMAGE_FORMATS } from '../../lib/cloudinary.js';
import pool from '../../db.js';

const router = Router();
router.param('id', uuidParam);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 }, fileFilter: imageFileFilter });

// ── Testimonials ──────────────────────────────────────────────
router.get('/testimonials', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.testimonials ORDER BY sort_order ASC, created_at DESC');
  res.json(rows);
}));

const testimonialRules = [
  body('name').trim().isLength({ min: 2, max: 60 }),
  body('text').trim().isLength({ min: 5, max: 600 }),
  body('area').optional({ values: 'falsy' }).trim().isLength({ max: 60 }),
  body('rating').optional({ values: 'null' }).isInt({ min: 1, max: 5 }),
  body('source').optional({ values: 'falsy' }).isIn(['google', 'whatsapp', 'facebook', 'in-person']),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt(),
];

router.post('/testimonials', testimonialRules, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    'INSERT INTO public.testimonials (name, area, text, rating, source, is_active, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [b.name, b.area || null, b.text, b.rating ?? null, b.source || null, b.is_active ?? true, b.sort_order ?? 0]
  );
  res.status(201).json(rows[0]);
}));

router.put('/testimonials/:id', testimonialRules, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    'UPDATE public.testimonials SET name=$1, area=$2, text=$3, rating=$4, source=$5, is_active=$6, sort_order=$7 WHERE id=$8 RETURNING *',
    [b.name, b.area || null, b.text, b.rating ?? null, b.source || null, b.is_active ?? true, b.sort_order ?? 0, req.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'NotFound', 'Review not found.');
  res.json(rows[0]);
}));

router.delete('/testimonials/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.testimonials WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Review not found.');
  res.json({ success: true });
}));

// ── Gallery ───────────────────────────────────────────────────
router.get('/gallery', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.gallery ORDER BY sort_order ASC, created_at DESC');
  res.json(rows);
}));

router.post('/gallery', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'NoFile', 'Please choose a photo.');
  const caption = String(req.body.caption || '').trim().slice(0, 120) || null;
  const url = await uploadBuffer(req.file.buffer, {
    folder: 'onewater/gallery', resource_type: 'image', allowed_formats: IMAGE_FORMATS,
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
  });
  const { rows } = await pool.query(
    'INSERT INTO public.gallery (image_url, caption, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [url, caption, Number(req.body.sort_order) || 0]
  );
  res.status(201).json(rows[0]);
}));

router.patch('/gallery/:id', [body('caption').optional({ nullable: true }).isString().isLength({ max: 120 }), body('is_active').optional().isBoolean(), body('sort_order').optional().isInt()], validate,
  asyncHandler(async (req, res) => {
    const fields = ['caption', 'is_active', 'sort_order'].filter((f) => req.body[f] !== undefined);
    if (!fields.length) throw new HttpError(400, 'BadRequest', 'Nothing to update.');
    const { rows } = await pool.query(
      `UPDATE public.gallery SET ${fields.map((f, i) => `${f} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *`,
      [req.params.id, ...fields.map((f) => req.body[f])]
    );
    if (!rows.length) throw new HttpError(404, 'NotFound', 'Photo not found.');
    res.json(rows[0]);
  }));

router.delete('/gallery/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.gallery WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Photo not found.');
  res.json({ success: true });
}));

export default router;
