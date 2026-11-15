// lib/promo.js — promo code eligibility (shared by /promo/validate and order creation)
import { normalizePkPhone } from './pricing.js';

/**
 * Loads a promo and checks it is usable. With `lock`, the row is locked
 * (FOR UPDATE) so concurrent orders cannot exceed max_uses.
 * Returns { promo } or { error } — error is a customer-facing message.
 */
export async function findUsablePromo(db, rawCode, { phone = null, lock = false } = {}) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { error: 'Please enter a promo code.' };
  const { rows } = await db.query(
    `SELECT * FROM public.promo_codes WHERE UPPER(code) = $1 ${lock ? 'FOR UPDATE' : ''}`,
    [code]
  );
  const promo = rows[0];
  if (!promo || !promo.is_active) return { error: 'This promo code is not valid.' };
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return { error: 'This promo code has expired.' };
  if (promo.max_uses !== null && promo.max_uses !== undefined && promo.times_used >= promo.max_uses) {
    return { error: 'This promo code has reached its usage limit.' };
  }
  const normalizedPhone = phone ? normalizePkPhone(phone) : null;
  if (promo.once_per_customer && normalizedPhone) {
    const used = await db.query(
      `SELECT 1 FROM public.orders WHERE promo_code = $1 AND phone = $2 AND status <> 'rejected' LIMIT 1`,
      [promo.code, normalizedPhone]
    );
    if (used.rows.length) return { error: 'This code can only be used once per customer.' };
  }
  return { promo };
}
