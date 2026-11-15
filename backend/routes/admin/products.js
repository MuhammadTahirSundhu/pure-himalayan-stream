// routes/admin/products.js — product catalogue management
import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { validate } from '../../middleware/validate.js';
import { asyncHandler, HttpError } from '../../lib/asyncHandler.js';
import { uploadBuffer, imageFileFilter, IMAGE_FORMATS } from '../../lib/cloudinary.js';
import pool from '../../db.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: imageFileFilter });
const router = Router();

const uploadImage = (file) => uploadBuffer(file.buffer, {
  folder: 'onewater/products', resource_type: 'image', allowed_formats: IMAGE_FORMATS,
  transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
});

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM public.products ORDER BY price ASC');
  res.json(rows);
}));

router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
  const { id, name, size, price, description, category } = req.body;
  if (!id?.trim() || !name?.trim() || !size?.trim() || price === undefined || price === '' || !category) {
    throw new HttpError(400, 'ValidationError', 'id, name, size, price and category are required.');
  }
  if (!/^[a-z0-9-]{1,40}$/i.test(id.trim())) throw new HttpError(400, 'ValidationError', 'ID may only contain letters, numbers and dashes.');
  const p = Number(price);
  if (!Number.isFinite(p) || p < 0) throw new HttpError(400, 'ValidationError', 'Price must be 0 or more.');
  if (!['bottle', 'dispenser'].includes(category)) throw new HttpError(400, 'ValidationError', 'Category must be bottle or dispenser.');

  const image_url = req.file ? await uploadImage(req.file) : null;
  try {
    const { rows } = await pool.query(
      `INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [id.trim(), name.trim().slice(0, 80), size.trim().slice(0, 20), p, description?.slice(0, 500) || null, image_url, category]
    );
    res.status(201).json({ success: true, product: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Duplicate', 'A product with this ID already exists.');
    throw err;
  }
}));

router.put(
  '/:id',
  [
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be 0 or more'),
    body('in_stock').optional().isBoolean(),
    body('name').optional().trim().isLength({ min: 1, max: 80 }),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const allowed = ['price', 'in_stock', 'description', 'name'];
    const fields = allowed.filter((f) => req.body[f] !== undefined);
    if (!fields.length) throw new HttpError(400, 'BadRequest', 'No fields provided to update.');
    const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE public.products SET ${sets} WHERE id = $${fields.length + 1} RETURNING *`,
      [...fields.map((f) => req.body[f]), req.params.id]
    );
    if (!rows.length) throw new HttpError(404, 'NotFound', 'Product not found.');
    res.json({ success: true, product: rows[0] });
  })
);

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM public.products WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'NotFound', 'Product not found.');
  res.json({ success: true });
}));

export default router;
