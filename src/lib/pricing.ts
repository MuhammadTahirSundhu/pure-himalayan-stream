// lib/pricing.ts — client-side ESTIMATE that mirrors backend/lib/pricing.js.
// The server re-prices every order; checkout always shows the server quote.
import type { SiteSettings } from './types';
import type { CartItem } from '@/contexts/CartContext';

export function estimateCart(items: CartItem[], delivery: SiteSettings['delivery_info'], discountPct = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deposit = items.reduce(
    (s, i) => s + (i.category === 'dispenser' ? Math.min(i.quantity, i.newBottles ?? i.quantity) * delivery.bottle_deposit : 0),
    0
  );
  const discount = Math.round((subtotal * discountPct) / 100);
  const deliveryFee = delivery.charge_delivery && subtotal - discount < delivery.free_delivery_threshold ? delivery.base_delivery_fee : 0;
  return { subtotal, deposit, discount, deliveryFee, total: subtotal - discount + deposit + deliveryFee };
}

export const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString('en-PK')}`;
