// lib/pricing.js — the ONLY place an order total is calculated.
// Pure functions (no DB) so they can be unit-tested; routes load the inputs.

const round = (n) => Math.round(n * 100) / 100;

/**
 * @param {object} args
 * @param {Array<{id:string, quantity:number, new_bottles?:number}>} args.items  what the customer asked for
 * @param {Map<string, {id,name,price,category,in_stock}>} args.products          catalogue rows keyed by id
 * @param {{bottle_deposit:number, charge_delivery:boolean, base_delivery_fee:number, free_delivery_threshold:number}} args.delivery
 * @param {null|{code:string, discount_percentage:number, min_order_amount?:number}} args.promo
 * @param {number} [args.referralDiscount]  fixed PKR off for a referred first-time customer
 * @param {number} [args.credit]            the customer's earned referral credit (PKR)
 * @returns {{lines, subtotal, deposit_total, discount, referral_discount, credit_applied, delivery_fee, total}}
 * @throws {Error & {code:string}} for unknown/out-of-stock products
 */
export function priceOrder({ items, products, delivery, promo = null, referralDiscount = 0, credit = 0 }) {
  const lines = items.map((item) => {
    const product = products.get(String(item.id));
    if (!product) throw Object.assign(new Error(`Unknown product: ${item.id}`), { code: 'UnknownProduct' });
    if (product.in_stock === false) {
      throw Object.assign(new Error(`${product.name} is currently out of stock.`), { code: 'OutOfStock' });
    }
    const quantity = Math.max(1, Math.floor(Number(item.quantity)));
    const unit = Number(product.price);
    // Refundable deposit applies only to returnable 19L (dispenser) bottles, per NEW bottle.
    // Customers exchanging their own empties pay no deposit for those bottles.
    let newBottles = 0;
    if (product.category === 'dispenser') { // returnable 19L bottle (accessories never carry a deposit)
      const requested = item.new_bottles === undefined ? quantity : Math.floor(Number(item.new_bottles));
      newBottles = Math.min(quantity, Math.max(0, Number.isFinite(requested) ? requested : quantity));
    }
    const depositEach = product.category === 'dispenser' ? Number(delivery.bottle_deposit || 0) : 0;
    return {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: unit,
      line_total: round(unit * quantity),
      new_bottles: newBottles,
      deposit: round(depositEach * newBottles),
    };
  });

  const subtotal = round(lines.reduce((s, l) => s + l.line_total, 0));
  const deposit_total = round(lines.reduce((s, l) => s + l.deposit, 0));

  // Promo discounts the water only — never the refundable deposit or delivery.
  let discount = 0;
  if (promo) {
    const min = Number(promo.min_order_amount || 0);
    if (subtotal < min) {
      throw Object.assign(new Error(`Promo ${promo.code} needs a minimum order of PKR ${min}.`), { code: 'PromoMinimum' });
    }
    discount = Math.round(subtotal * Number(promo.discount_percentage) / 100); // whole rupees
  }

  // Referral discount and earned credit also apply to water only, never below zero.
  const referral_discount = Math.min(Math.max(0, Math.round(Number(referralDiscount) || 0)), subtotal - discount);
  const credit_applied = Math.min(Math.max(0, Math.round(Number(credit) || 0)), subtotal - discount - referral_discount);
  const waterAfterDiscounts = subtotal - discount - referral_discount - credit_applied;

  const delivery_fee =
    delivery.charge_delivery && waterAfterDiscounts < Number(delivery.free_delivery_threshold || 0)
      ? round(Number(delivery.base_delivery_fee || 0))
      : 0;

  const total = round(waterAfterDiscounts + deposit_total + delivery_fee);
  return { lines, subtotal, deposit_total, discount, referral_discount, credit_applied, delivery_fee, total };
}

/** Allowed admin status changes. Delivered/rejected are final. */
export const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['dispatched', 'rejected'],
  dispatched: ['delivered', 'rejected'],
  delivered: [],
  rejected: [],
};

export const canTransition = (from, to) => from === to || (ORDER_TRANSITIONS[from] || []).includes(to);

/** Normalises Pakistani mobile numbers to 03XXXXXXXXX; returns null if invalid. */
export function normalizePkPhone(raw) {
  const digits = String(raw || '').replace(/[^\d+]/g, '');
  let d = digits.replace(/^\+/, '');
  if (d.startsWith('0092')) d = d.slice(4);
  else if (d.startsWith('92')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  if (/^3\d{9}$/.test(d)) return `0${d}`;
  // Landlines (e.g. 055-xxxxxxx) — 9 to 10 digits after the leading 0
  if (/^[1-9]\d{8,9}$/.test(d)) return `0${d}`;
  return null;
}

/** Days between refills for a delivery schedule. */
export const SCHEDULE_DAYS = { weekly: 7, biweekly: 14, monthly: 30 };
