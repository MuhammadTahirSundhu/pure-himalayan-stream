// routes/admin/settings.js — site settings, lab report upload, password change
import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { validate } from '../../middleware/validate.js';
import { asyncHandler, withTransaction, HttpError } from '../../lib/asyncHandler.js';
import { uploadBuffer } from '../../lib/cloudinary.js';
import { getSettings, sanitizeSettingsUpdate } from '../../lib/settings.js';
import pool from '../../db.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || /^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'InvalidFile', 'Upload a PDF, JPG, PNG or WebP file.'));
  },
});

const router = Router();

const saveSettings = (settings) => withTransaction(pool, async (client) => {
  for (const [key, value] of Object.entries(settings)) {
    await client.query(
      `INSERT INTO public.site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, JSON.stringify(value)]
    );
  }
});

/** GET /api/admin/settings — full settings (incl. disabled payment accounts). */
router.get('/', asyncHandler(async (req, res) => {
  res.json(await getSettings());
}));

/** PUT /api/admin/settings — { settings: { key: value } }, known keys only. */
router.put('/', [body('settings').isObject()], validate, asyncHandler(async (req, res) => {
  let clean;
  try {
    clean = sanitizeSettingsUpdate(req.body.settings);
  } catch (err) {
    throw new HttpError(400, 'ValidationError', err.message);
  }
  await saveSettings(clean);
  res.json({ success: true, settings: await getSettings() });
}));

/** POST /api/admin/settings/quality — upload the lab report shown on /quality. */
router.post('/quality', upload.single('report'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'NoFile', 'Please choose a file.');
  const isPdf = req.file.mimetype === 'application/pdf';
  const url = await uploadBuffer(req.file.buffer, {
    folder: 'onewater/quality',
    resource_type: isPdf ? 'raw' : 'image',
    ...(isPdf ? { format: 'pdf' } : {}),
  });
  await saveSettings({ lab_report_url: url });
  res.json({ success: true, url });
}));

/** PUT /api/admin/settings/password — also signs out every other session. */
router.put(
  '/password',
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 10, max: 200 }).withMessage('New password must be at least 10 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT password_hash FROM public.admin_users WHERE id = $1', [req.admin.id]);
    if (!rows.length) throw new HttpError(404, 'NotFound', 'Admin user not found.');
    if (!(await bcrypt.compare(req.body.current_password, rows[0].password_hash))) {
      throw new HttpError(400, 'InvalidCredentials', 'Current password is incorrect.');
    }
    const hash = await bcrypt.hash(req.body.new_password, 12);
    await pool.query(
      'UPDATE public.admin_users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2',
      [hash, req.admin.id]
    );
    res.json({ success: true, message: 'Password updated. Please log in again.' });
  })
);

export default router;
