// routes/admin/products.js — OneWater Pakistan
// Admin product management endpoints (GET, POST, PUT, DELETE)

import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { validate } from '../../middleware/validate.js';
import pool from '../../db.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — stream directly to Cloudinary, nothing saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

/**
 * GET /api/admin/products
 * Returns all products for the admin panel.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.products ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/products] GET error:', err.message);
    res.status(500).json({ error: 'ServerError', message: 'Failed to fetch products.' });
  }
});

/**
 * POST /api/admin/products
 * Creates a new product. Accepts multipart/form-data.
 * Fields: id, name, size, price, category (text) + image (file, optional)
 */
router.post('/', upload.single('image'), async (req, res) => {
  const { id, name, size, price, description, category } = req.body;

  // Basic validation
  if (!id || !name || !size || !price || !category) {
    return res.status(400).json({ error: 'ValidationError', message: 'id, name, size, price and category are required.' });
  }
  if (!['bottle', 'dispenser'].includes(category)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Category must be bottle or dispenser.' });
  }

  let image_url = null;

  // Upload to Cloudinary if an image was provided
  if (req.file) {
    try {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'onewater/products',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      image_url = uploaded.secure_url;
      console.log(`[admin/products] Image uploaded to Cloudinary: ${image_url}`);
    } catch (err) {
      console.error('[admin/products] Cloudinary upload error:', err.message);
      return res.status(500).json({ error: 'UploadError', message: 'Failed to upload product image.' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [id.trim(), name.trim(), size.trim(), parseFloat(price), description || null, image_url, category]
    );
    console.log(`[admin/products] Created product: ${id} — ${name}`);
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error('[admin/products] POST error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate', message: 'A product with this ID already exists.' });
    }
    res.status(500).json({ error: 'ServerError', message: 'Failed to create product.' });
  }
});



/**
 * PUT /api/admin/products/:id
 * Updates a product's price, stock status, or description.
 * Body: { price?, in_stock?, description?, name? }
 */
router.put(
  '/:id',
  [
    param('id').notEmpty(),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('in_stock').optional().isBoolean().withMessage('in_stock must be boolean'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
  ],
  validate,
  async (req, res) => {
    const { id } = req.params;
    const { price, in_stock, description, name } = req.body;

    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (price !== undefined)       { fields.push(`price = $${idx++}`);       values.push(price); }
      if (in_stock !== undefined)    { fields.push(`in_stock = $${idx++}`);    values.push(in_stock); }
      if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
      if (name !== undefined)        { fields.push(`name = $${idx++}`);        values.push(name); }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'BadRequest', message: 'No fields provided to update.' });
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE public.products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NotFound', message: 'Product not found.' });
      }

      console.log(`[admin/products] Product ${id} updated`);
      res.json({ success: true, product: result.rows[0] });
    } catch (err) {
      console.error('[admin/products] PUT /:id error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to update product.' });
    }
  }
);

/**
 * DELETE /api/admin/products/:id
 * Deletes a product by ID.
 */
router.delete(
  '/:id',
  [param('id').notEmpty()],
  validate,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM public.products WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NotFound', message: 'Product not found.' });
      }
      console.log(`[admin/products] Product ${id} deleted`);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/products] DELETE /:id error:', err.message);
      res.status(500).json({ error: 'ServerError', message: 'Failed to delete product.' });
    }
  }
);

export default router;
