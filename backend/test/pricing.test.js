import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceOrder, canTransition, normalizePkPhone } from '../lib/pricing.js';

const products = new Map([
  ['500ml', { id: '500ml', name: '500ml', price: '50', category: 'bottle', in_stock: true }],
  ['19l', { id: '19l', name: '19L', price: '250', category: 'dispenser', in_stock: true }],
  ['gone', { id: 'gone', name: 'Gone', price: '10', category: 'bottle', in_stock: false }],
]);
const delivery = { bottle_deposit: 1000, charge_delivery: false, base_delivery_fee: 0, free_delivery_threshold: 0 };

test('uses catalogue prices, not client prices', () => {
  const r = priceOrder({ items: [{ id: '500ml', quantity: 3, price: 1 }], products, delivery });
  assert.equal(r.total, 150);
});

test('deposit is charged per NEW 19L bottle only', () => {
  const r = priceOrder({ items: [{ id: '19l', quantity: 3, new_bottles: 1 }], products, delivery });
  assert.equal(r.subtotal, 750);
  assert.equal(r.deposit_total, 1000);
  assert.equal(r.total, 1750);
});

test('new_bottles defaults to quantity and is capped at quantity', () => {
  assert.equal(priceOrder({ items: [{ id: '19l', quantity: 2 }], products, delivery }).deposit_total, 2000);
  assert.equal(priceOrder({ items: [{ id: '19l', quantity: 2, new_bottles: 9 }], products, delivery }).deposit_total, 2000);
});

test('promo discounts water only, never the deposit', () => {
  const promo = { code: 'X', discount_percentage: 10, min_order_amount: 0 };
  const r = priceOrder({ items: [{ id: '19l', quantity: 2 }], products, delivery, promo });
  assert.equal(r.discount, 50);
  assert.equal(r.total, 500 - 50 + 2000);
});

test('promo minimum order is enforced', () => {
  const promo = { code: 'BIG', discount_percentage: 20, min_order_amount: 5000 };
  assert.throws(() => priceOrder({ items: [{ id: '500ml', quantity: 1 }], products, delivery, promo }), { code: 'PromoMinimum' });
});

test('delivery fee applies below threshold when enabled', () => {
  const d = { ...delivery, charge_delivery: true, base_delivery_fee: 100, free_delivery_threshold: 500 };
  assert.equal(priceOrder({ items: [{ id: '500ml', quantity: 2 }], products, delivery: d }).delivery_fee, 100);
  assert.equal(priceOrder({ items: [{ id: '500ml', quantity: 10 }], products, delivery: d }).delivery_fee, 0);
});

test('unknown and out-of-stock products are rejected', () => {
  assert.throws(() => priceOrder({ items: [{ id: 'nope', quantity: 1 }], products, delivery }), { code: 'UnknownProduct' });
  assert.throws(() => priceOrder({ items: [{ id: 'gone', quantity: 1 }], products, delivery }), { code: 'OutOfStock' });
});

test('order status lifecycle', () => {
  assert.ok(canTransition('pending', 'confirmed'));
  assert.ok(!canTransition('pending', 'delivered'));
  assert.ok(!canTransition('delivered', 'pending'));
  assert.ok(canTransition('dispatched', 'rejected'));
});

test('Pakistani phone normalisation', () => {
  assert.equal(normalizePkPhone('0300 1234567'), '03001234567');
  assert.equal(normalizePkPhone('+92 300-1234567'), '03001234567');
  assert.equal(normalizePkPhone('923001234567'), '03001234567');
  assert.equal(normalizePkPhone('12345'), null);
});

test('referral discount and credit reduce water only and never go negative', () => {
  const r = priceOrder({ items: [{ id: '19l', quantity: 1 }], products, delivery, referralDiscount: 100, credit: 500 });
  assert.equal(r.referral_discount, 100);
  assert.equal(r.credit_applied, 150);      // capped at remaining water value (250 - 100)
  assert.equal(r.total, 0 + 1000);          // only the refundable deposit remains
});

test('promo and referral discount both cap at the water subtotal', () => {
  const promo = { code: 'X', discount_percentage: 50, min_order_amount: 0 };
  const r = priceOrder({ items: [{ id: '500ml', quantity: 2 }], products, delivery, promo, referralDiscount: 500 });
  assert.equal(r.discount, 50);
  assert.equal(r.referral_discount, 50);
  assert.equal(r.total, 0);
});
