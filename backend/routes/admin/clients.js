// routes/admin/clients.js — Protected admin endpoints for managing clients
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import pool from '../../db.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — file stays in RAM, streamed directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = express.Router();

// GET /api/admin/clients — list all clients (including inactive)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.clients ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/clients] GET error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch clients.' });
  }
});

// POST /api/admin/clients — add a new client (multipart/form-data)
// Fields: name (text), website_url (text), sort_order (text), logo (file — optional)
router.post('/', upload.single('logo'), async (req, res) => {
  const { name, website_url, sort_order } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Client name is required.' });
  }

  let logo_url = null;

  // Upload logo to Cloudinary if a file was provided
  if (req.file) {
    try {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'onewater/clients',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'],
            transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      logo_url = uploaded.secure_url;
      console.log(`[admin/clients] Logo uploaded to Cloudinary: ${logo_url}`);
    } catch (err) {
      console.error('[admin/clients] Cloudinary upload error:', err.message);
      return res.status(500).json({ error: 'UploadError', message: 'Failed to upload logo to Cloudinary.' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.clients (name, logo_url, website_url, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [String(name).trim(), logo_url, website_url || null, Number(sort_order) || 0]
    );
    res.status(201).json({ client: result.rows[0] });
  } catch (err) {
    console.error('[admin/clients] POST error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to create client.' });
  }
});

// PATCH /api/admin/clients/:id/toggle — toggle is_active
router.patch('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.clients SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    res.json({ client: result.rows[0] });
  } catch (err) {
    console.error('[admin/clients] PATCH toggle error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to toggle client.' });
  }
});

// DELETE /api/admin/clients/:id — delete a client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.clients WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[admin/clients] DELETE error:', err.message);
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete client.' });
  }
});

export default router;

