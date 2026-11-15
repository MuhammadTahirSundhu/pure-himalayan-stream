// lib/lastOrder.ts — remembers this device's last order (ref + phone + items)
// for "Track my order" and one-tap "Order again". Nothing leaves the device.
export const LAST_ORDER_REF_KEY = 'ow_last_order_ref';

export interface LastOrder {
  order_ref: string;
  phone: string;
  placed_at: string;
  items: Array<{ id: string; quantity: number }>;
  schedule?: string;
}

export function saveLastOrder(o: LastOrder) {
  try { localStorage.setItem(LAST_ORDER_REF_KEY, JSON.stringify(o)); } catch { /* storage unavailable */ }
}

export function loadLastOrder(): LastOrder | null {
  try {
    const o = JSON.parse(localStorage.getItem(LAST_ORDER_REF_KEY) || 'null');
    return o && o.order_ref && Array.isArray(o.items) ? o : null;
  } catch { return null; }
}
