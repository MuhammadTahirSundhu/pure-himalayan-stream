// routes/admin/products.js — OneWater Pakistan
// Admin product management endpoints

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
      // Build dynamic SET clause for only provided fields
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

export default router;
