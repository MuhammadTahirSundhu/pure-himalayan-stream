// routes/admin/clients.js — "Trusted by" client logos
import { Router } from 'express';
import multer from 'multer';
import { uuidParam } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import { uploadBuffer, imageFileFilter, IMAGE_FORMATS } from '../../lib/cloudinary.js';
import pool from '../../db.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024, files: 1 }, fileFilter: imageFileFilter });
const router = Router();
router.param('id', uuidParam);

/** Only http(s) links — blocks javascript: URLs in the public marquee. */
const safeUrl = (raw) => {
  if (!raw) return null;
  try {
    const u = new URL(String(raw).trim());
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
};

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.clients ORDER BY sort_order ASC, created_at ASC');
  res.json(rows);
}));

router.post('/', upload.single('logo'), asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80);
  if (!name) throw new HttpError(400, 'ValidationError', 'Client name is required.');
  const website_url = safeUrl(req.body.website_url);
  if (website_url === undefined) throw new HttpError(400, 'ValidationError', 'Website must start with http:// or https://');
  const logo_url = req.file
    ? await uploadBuffer(req.file.buffer, {
        folder: 'onewater/clients', resource_type: 'image', allowed_formats: IMAGE_FORMATS,
        transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
      })
    : null;
  const { rows } = await pool.query(
    'INSERT INTO public.clients (name, logo_url, website_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, logo_url, website_url, Number(req.body.sort_order) || 0]
  );
  res.status(201).json({ client: rows[0] });
}));

router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('UPDATE public.clients SET is_active = NOT is_active WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'NotFound', 'Client not found.');
  res.json({ client: rows[0] });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.clients WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Client not found.');
  res.json({ success: true });
}));

export default router;
