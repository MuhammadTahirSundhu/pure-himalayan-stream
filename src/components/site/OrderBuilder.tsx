import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';

const SCHEDULES = { once: 'One-time', weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month' } as const;

/** Build an order and send it as a pre-filled WhatsApp message. */
export default function OrderBuilder() {
  const { data: products = [] } = useProducts();
  const { settings } = useSiteSettings();
  const available = products.filter((p) => p.inStock);
  const [productId, setProductId] = useState<string>('');
  const [qty, setQty] = useState(2);
  const [area, setArea] = useState('');
  const [schedule, setSchedule] = useState<keyof typeof SCHEDULES>('once');

  const product = available.find((p) => p.id === productId) ?? available.find((p) => p.category === 'dispenser') ?? available[0];
  const isDispenser = product?.category === 'dispenser';
  const estimate = product ? product.price * qty : 0;

  const message = useMemo(() => {
    if (!product) return 'Assalam o Alaikum One Water! I would like to order water.';
    return [
      'Assalam o Alaikum One Water! I would like to order:',
      `• ${qty} × ${product.name}`,
      isDispenser ? `• Delivery: ${SCHEDULES[schedule]}` : null,
      `• Area: ${area || '(my area in Gujranwala)'}`,
      `Estimated: ${pkr(estimate)}${isDispenser ? ' + refundable deposit for any new bottles' : ''}`,
    ].filter(Boolean).join('\n');
  }, [product, qty, schedule, area, estimate, isDispenser]);

  return (
    <div className="ow-card p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="ow-label" htmlFor="ob-product">Product</label>
          <select id="ob-product" className="ow-input" value={product?.id ?? ''} onChange={(e) => setProductId(e.target.value)}>
            {available.map((p) => <option key={p.id} value={p.id}>{p.name} — {pkr(p.price)}</option>)}
            {!available.length && <option value="">Water (we'll confirm price)</option>}
          </select>
        </div>
        <div>
          <span className="ow-label">Quantity</span>
          <div className="flex items-center gap-3">
            <button type="button" className="ow-btn-ghost !p-3" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></button>
            <span className="w-10 text-center text-xl font-bold text-white tabular-nums">{qty}</span>
            <button type="button" className="ow-btn-ghost !p-3" aria-label="Increase" onClick={() => setQty((q) => Math.min(500, q + 1))}><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div>
          <label className="ow-label" htmlFor="ob-area">Your area in Gujranwala</label>
          <input id="ob-area" className="ow-input" placeholder="e.g. Satellite Town, Model Town" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        {isDispenser && (
          <div>
            <label className="ow-label" htmlFor="ob-schedule">How often?</label>
            <select id="ob-schedule" className="ow-input" value={schedule} onChange={(e) => setSchedule(e.target.value as keyof typeof SCHEDULES)}>
              {Object.entries(SCHEDULES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs ow-subtle uppercase tracking-wider">Estimated total</p>
          <p className="font-heading font-black text-3xl text-white">{pkr(estimate)}</p>
          {isDispenser && <p className="text-xs ow-muted">+ {pkr(settings.delivery_info.bottle_deposit)} refundable deposit per new bottle</p>}
        </div>
        <a href={whatsappLink(settings.contact_info.whatsapp, message)} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp">
          <WhatsAppIcon /> Send order on WhatsApp
        </a>
      </div>
    </div>
  );
}
