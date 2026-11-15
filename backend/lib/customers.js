// lib/customers.js — customer records keyed by phone, bottle/deposit ledger and referrals.
// Every function takes a pg client so it can run inside the order transaction.
import crypto from 'crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
const makeCode = () => 'OW' + Array.from(crypto.randomBytes(5), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');

/** Creates/updates the customer behind an order. Returns the locked customer row. */
export async function upsertCustomerForOrder(db, { phone, name, city, area, street, schedule }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.query(
        `INSERT INTO public.customers (phone, name, city, area, street, referral_code, orders_count, last_order_at, delivery_schedule)
         VALUES ($1,$2,$3,$4,$5,$6,0,now(),$7)
         ON CONFLICT (phone) DO UPDATE SET
           name = EXCLUDED.name, city = EXCLUDED.city, area = COALESCE(EXCLUDED.area, customers.area), street = EXCLUDED.street,
           last_order_at = now(),
           delivery_schedule = COALESCE(EXCLUDED.delivery_schedule, customers.delivery_schedule),
           referral_code = COALESCE(customers.referral_code, EXCLUDED.referral_code)`,
        [phone, name, city, area || null, street, makeCode(), schedule && schedule !== 'once' ? schedule : null]
      );
      break;
    } catch (err) {
      if (err.code !== '23505' || attempt === 4) throw err; // referral code collision → retry
    }
  }
  const { rows } = await db.query('SELECT * FROM public.customers WHERE phone = $1 FOR UPDATE', [phone]);
  return rows[0];
}

/** Has this phone placed any order that wasn't rejected (excluding `exceptOrderId`)? */
export async function hasPreviousOrders(db, phone, exceptOrderId = null) {
  const { rows } = await db.query(
    `SELECT 1 FROM public.orders WHERE phone = $1 AND status <> 'rejected' AND ($2::uuid IS NULL OR id <> $2) LIMIT 1`,
    [phone, exceptOrderId]
  );
  return rows.length > 0;
}

/**
 * Validates a referral code for a (new) customer.
 * Returns { discount, code } or { error }.
 */
export async function resolveReferral(db, rawCode, phone, referralSettings) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { discount: 0, code: null };
  if (!referralSettings.enabled || !referralSettings.new_customer_discount) return { error: 'Referral rewards are not running at the moment.' };
  const { rows } = await db.query('SELECT phone FROM public.customers WHERE referral_code = $1', [code]);
  if (!rows.length) return { error: 'This referral code is not valid.' };
  if (phone && rows[0].phone === phone) return { error: "You can't use your own referral code." };
  if (phone && (await hasPreviousOrders(db, phone))) return { error: 'Referral codes are for first orders only.' };
  return { discount: Number(referralSettings.new_customer_discount), code };
}

/** Called once when an order becomes "delivered". */
export async function applyDelivered(db, order, referralSettings) {
  const { rows: [agg] } = await db.query(
    'SELECT COALESCE(SUM(new_bottles),0)::int AS bottles FROM public.order_items WHERE order_id = $1',
    [order.id]
  );
  const deposit = Number(order.deposit_total || 0);
  await db.query(
    `UPDATE public.customers SET bottles_held = bottles_held + $2, deposit_held = deposit_held + $3,
       orders_count = orders_count + 1, last_delivered_at = now()
     WHERE phone = $1`,
    [order.phone, agg.bottles, deposit]
  );
  if (agg.bottles) {
    await db.query(
      `INSERT INTO public.bottle_events (phone, order_id, bottles_change, deposit_change, note) VALUES ($1,$2,$3,$4,$5)`,
      [order.phone, order.id, agg.bottles, deposit, `Delivered ${order.order_ref}`]
    );
  }
  // Reward the referrer once this referred customer's first order is delivered.
  if (order.referral_code_used && referralSettings.enabled && referralSettings.referrer_credit > 0) {
    const { rows: prior } = await db.query(
      `SELECT 1 FROM public.orders WHERE phone = $1 AND status = 'delivered' AND id <> $2 LIMIT 1`,
      [order.phone, order.id]
    );
    if (!prior.length) {
      await db.query(
        'UPDATE public.customers SET referral_credit = referral_credit + $2 WHERE referral_code = $1 AND phone <> $3',
        [order.referral_code_used, referralSettings.referrer_credit, order.phone]
      );
      await db.query('UPDATE public.customers SET referred_by = COALESCE(referred_by, $2) WHERE phone = $1', [order.phone, order.referral_code_used]);
    }
  }
}

/** Called when an order is rejected: give back reserved credit and the promo use. */
export async function applyRejected(db, order) {
  if (Number(order.credit_applied) > 0) {
    await db.query('UPDATE public.customers SET referral_credit = referral_credit + $2 WHERE phone = $1', [order.phone, order.credit_applied]);
  }
  if (order.promo_code) {
    await db.query('UPDATE public.promo_codes SET times_used = GREATEST(times_used - 1, 0) WHERE code = $1', [order.promo_code]);
  }
}
