// routes/settings.js — GET /api/settings (public, read-only subset)
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { getSettings, activePaymentAccounts } from '../lib/settings.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const s = await getSettings();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    payment_accounts: activePaymentAccounts(s).map(({ id, label, number, title }) => ({ id, label, number, title })),
    contact_info: s.contact_info,
    delivery_info: s.delivery_info,
    service_areas: s.service_areas,
    lab_report_url: s.lab_report_url || null,
    business_hours: s.business_hours,
    referral: s.referral,
    google_review_url: s.google_review_url || null,
  });
}));

export default router;
