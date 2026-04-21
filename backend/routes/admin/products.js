// routes/admin/products.js — OneWater Pakistan
// Admin product management endpoints (GET, POST, PUT, DELETE)

import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middleware/validate.js';
import pool from '../../db.js';

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
 * Creates a new product.
 * Body: { id, name, size, price, description?, image_url?, category }
 */
router.post(
  '/',
  [
    body('id').notEmpty().trim().withMessage('Product ID is required'),
    body('name').notEmpty().trim().withMessage('Product name is required'),
    body('size').notEmpty().trim().withMessage('Size is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').isIn(['bottle', 'dispenser']).withMessage('Category must be bottle or dispenser'),
    body('description').optional().trim(),
    body('image_url').optional().trim(),
  ],
  validate,
  async (req, res) => {
    const { id, name, size, price, description, image_url, category } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
        [id, name, size, price, description || null, image_url || null, category]
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
  }
);

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
