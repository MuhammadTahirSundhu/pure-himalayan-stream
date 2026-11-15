// lib/settings.js — typed access to site_settings with safe defaults.
import pool from '../db.js';

export const DEFAULT_SETTINGS = {
  // Bank / wallet accounts shown at checkout. An account is only offered
  // when enabled AND it has a number — otherwise customers see COD only.
  payment_accounts: [
    { id: 'easypaisa', label: 'Easypaisa', number: '', title: '', enabled: true },
    { id: 'jazzcash', label: 'JazzCash', number: '', title: '', enabled: false },
    { id: 'bank', label: 'Bank Transfer', number: '', title: '', enabled: false },
  ],
  contact_info: {
    phone: '0320 313 3140',
    whatsapp: '923203133140',
    email: 'onewater.pk@gmail.com',
    address: 'Green Valley Phase 1, near Sialkot Bypass, Gujranwala',
    hours: 'Sat–Thu, 9:00 AM – 7:00 PM (Friday closed)',
  },
  delivery_info: {
    bottle_deposit: 1000,
    charge_delivery: false,
    base_delivery_fee: 0,
    free_delivery_threshold: 0,
    delivery_time: 'During business hours, 9 AM – 7 PM (Friday closed)',
  },
  service_areas: { cities: ['Gujranwala'], note: 'We deliver across all of Gujranwala city.' },
  lab_report_url: '',
  // Structured hours drive the "we're closed" notice. Days: 0=Sun … 5=Fri, 6=Sat (Pakistan time).
  business_hours: { open: '09:00', close: '19:00', closed_days: [5] },
  // Referral rewards are OFF until the owner sets amounts and enables them.
  referral: { enabled: false, new_customer_discount: 0, referrer_credit: 0 },
  google_review_url: '',
};

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

const PAYMENT_IDS = new Set(['easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'bank']);

/** Coerces any stored value (incl. the legacy {easypaisa:'0300…'} shape) into the current shape. */
const normalizePaymentAccounts = (value) => {
  if (Array.isArray(value)) return value;
  // legacy object shape → drop it; the old seed values were placeholders
  return DEFAULT_SETTINGS.payment_accounts;
};

export async function getSettings(db = pool) {
  const { rows } = await db.query('SELECT key, value FROM public.site_settings');
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const merged = {};
  for (const key of SETTING_KEYS) {
    const def = DEFAULT_SETTINGS[key];
    const val = stored[key];
    if (key === 'payment_accounts') merged[key] = normalizePaymentAccounts(val);
    else if (def && typeof def === 'object' && !Array.isArray(def)) merged[key] = { ...def, ...(val || {}) };
    else merged[key] = val ?? def;
  }
  return merged;
}

/** Accounts a customer may actually pay into. */
export const activePaymentAccounts = (settings) =>
  settings.payment_accounts.filter((a) => a.enabled && String(a.number || '').trim());

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, min = 0, max = 1e7) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

/** Validates + sanitises an admin settings update. Unknown keys are rejected. */
export function sanitizeSettingsUpdate(input) {
  const out = {};
  for (const [key, value] of Object.entries(input || {})) {
    switch (key) {
      case 'payment_accounts':
        if (!Array.isArray(value)) throw new Error('payment_accounts must be a list');
        out[key] = value
          .filter((a) => PAYMENT_IDS.has(a?.id))
          .map((a) => ({ id: a.id, label: str(a.label, 40) || a.id, number: str(a.number, 40), title: str(a.title, 80), enabled: Boolean(a.enabled) }));
        break;
      case 'contact_info':
        out[key] = {
          phone: str(value.phone, 40), whatsapp: str(value.whatsapp, 20).replace(/\D/g, ''),
          email: str(value.email, 120), address: str(value.address, 200), hours: str(value.hours, 80),
        };
        break;
      case 'delivery_info':
        out[key] = {
          bottle_deposit: num(value.bottle_deposit, 0, 100000),
          charge_delivery: Boolean(value.charge_delivery),
          base_delivery_fee: num(value.base_delivery_fee, 0, 100000),
          free_delivery_threshold: num(value.free_delivery_threshold, 0, 1e6),
          delivery_time: str(value.delivery_time, 80),
        };
        break;
      case 'service_areas': {
        const cities = (Array.isArray(value.cities) ? value.cities : []).map((c) => str(c, 60)).filter(Boolean);
        if (!cities.length) throw new Error('At least one service city is required');
        out[key] = { cities, note: str(value.note, 200) };
        break;
      }
      case 'lab_report_url':
        out[key] = str(value, 500);
        break;
      case 'google_review_url': {
        const url = str(value, 500);
        if (url && !/^https:\/\//.test(url)) throw new Error('Google review link must start with https://');
        out[key] = url;
        break;
      }
      case 'business_hours': {
        const time = (t, d) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : d);
        const days = (Array.isArray(value.closed_days) ? value.closed_days : []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
        out[key] = { open: time(value.open, '09:00'), close: time(value.close, '19:00'), closed_days: [...new Set(days)] };
        break;
      }
      case 'referral':
        out[key] = {
          enabled: Boolean(value.enabled),
          new_customer_discount: num(value.new_customer_discount, 0, 10000),
          referrer_credit: num(value.referrer_credit, 0, 10000),
        };
        break;
      default:
        throw new Error(`Unknown setting: ${key}`);
    }
  }
  return out;
}

export const isServiceCity = (settings, city) =>
  settings.service_areas.cities.some((c) => c.toLowerCase() === String(city || '').trim().toLowerCase());
