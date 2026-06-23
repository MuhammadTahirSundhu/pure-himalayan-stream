import express from 'express';
import pool from '../../db.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all offers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.offers ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new offer
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      id, title, description, original_price, sale_price,
      promo_code, discount_text, badge_text, color_gradient, icon_color,
      sort_order, is_active
    } = req.body;

    let imageUrl = null;

    if (req.file) {
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'onewater/offers',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const offerId = id || `offer-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO public.offers (
        id, title, description, original_price, sale_price, promo_code, discount_text,
        badge_text, color_gradient, icon_color, sort_order, is_active, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        offerId, title, description, original_price || 0, sale_price || 0, promo_code,
        discount_text, badge_text, color_gradient, icon_color, sort_order || 0,
        is_active === 'true' || is_active === true, imageUrl
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating offer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update offer
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, original_price, sale_price,
      promo_code, discount_text, badge_text, color_gradient, icon_color,
      sort_order, is_active, existing_image_url
    } = req.body;

    let imageUrl = existing_image_url;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'onewater/offers',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const result = await pool.query(
      `UPDATE public.offers SET
        title = $1, description = $2, original_price = $3, sale_price = $4,
        promo_code = $5, discount_text = $6, badge_text = $7, color_gradient = $8,
        icon_color = $9, sort_order = $10, is_active = $11, image_url = $12
      WHERE id = $13 RETURNING *`,
      [
        title, description, original_price || 0, sale_price || 0, promo_code,
        discount_text, badge_text, color_gradient, icon_color, sort_order || 0,
        is_active === 'true' || is_active === true, imageUrl, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating offer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE offer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM public.offers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
