// lib/notify.js — instant alerts to the owner. Never blocks or fails a request.
// Telegram (free): set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID on the server.

const enabled = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

async function sendTelegram(text) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
}

/** Fire-and-forget. */
export function notifyOwner(text) {
  if (!enabled()) return;
  sendTelegram(text).catch((err) => console.error('[notify] failed:', err.message));
}

const pkr = (n) => `Rs ${Math.round(Number(n)).toLocaleString('en-PK')}`;
const wa = (phone) => `https://wa.me/92${String(phone).replace(/^0/, '')}`;

export const formatOrderAlert = (o, lines) => [
  `🧾 New order ${o.order_ref} — ${pkr(o.total)}`,
  ...lines.map((l) => `• ${l.quantity} × ${l.product_name}`),
  `👤 ${o.customer_name} · ${o.phone}`,
  `📍 ${[o.street, o.area, o.city].filter(Boolean).join(', ')}`,
  `💳 ${o.payment_method === 'cod' ? 'Cash on delivery' : o.payment_method}${o.preferred_slot ? ` · ⏰ ${o.preferred_slot}` : ''}`,
  o.customer_note ? `📝 ${o.customer_note}` : null,
  `WhatsApp: ${wa(o.phone)}`,
].filter(Boolean).join('\n');
