import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PackageSearch, Search, CheckCircle2, Clock, Truck, ClipboardCheck, XCircle, RotateCcw, Star, Gift, Copy, Check } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { pkr } from '@/lib/pricing';
import type { TrackedOrder } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import PageHero from '@/components/site/PageHero';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';
import ClosedNotice from '@/components/site/ClosedNotice';
import Seo from '@/components/site/Seo';
import { loadLastOrder } from '@/lib/lastOrder';

const STEPS = [
  { id: 'pending', label: 'Order received', icon: ClipboardCheck },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'dispatched', label: 'On the way', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
] as const;
const SLOT = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' } as Record<string, string>;

export default function Track() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ order_ref: params.get('ref') ?? '', phone: '' });
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: products = [] } = useProducts();
  const { setItem, setIsOpen, setSchedule } = useCart();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (form.order_ref) return;
    const saved = loadLastOrder();
    if (saved) setForm({ order_ref: saved.order_ref, phone: saved.phone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      setOrder(await api<TrackedOrder>('/api/orders/track', { method: 'POST', json: form }));
    } catch (err) {
      setOrder(null);
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const reorder = () => {
    if (!order) return;
    for (const it of order.items) {
      const p = products.find((x) => x.id === it.product_id && x.inStock);
      if (!p) continue;
      // Repeat customers swap their empties, so no new bottles by default.
      setItem({ id: p.id, name: p.name, size: p.size, price: p.price, image: p.image, category: p.category, quantity: it.quantity, newBottles: p.category === 'dispenser' ? 0 : undefined });
    }
    if (order.delivery_schedule && order.delivery_schedule !== 'once') setSchedule(order.delivery_schedule as 'weekly' | 'biweekly' | 'monthly');
    setIsOpen(true);
  };
  const reorderable = order?.items.some((it) => products.some((p) => p.id === it.product_id && p.inStock));

  const stepIndex = order ? STEPS.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="ow-page">
      <Seo path="/track" title="Track your order | One Water" description="Check the status of your One Water order with your order number and phone." noindex />
      <PageHero eyebrow={<><PackageSearch className="w-4 h-4" /> Order tracking</>} title={<>Where is my <span className="ow-gradient-text">water?</span></>}
        subtitle="Enter your order number and the phone number you ordered with." />

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          <form onSubmit={lookup} className="ow-card p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end" noValidate>
            <div>
              <label className="ow-label" htmlFor="tr-ref">Order number</label>
              <input id="tr-ref" className="ow-input uppercase" placeholder="OW-261115-ABC123" value={form.order_ref} onChange={(e) => setForm({ ...form, order_ref: e.target.value })} />
            </div>
            <div>
              <label className="ow-label" htmlFor="tr-phone">Phone</label>
              <input id="tr-phone" className="ow-input" type="tel" inputMode="tel" placeholder="0300 1234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button className="ow-btn !py-3" disabled={loading}><Search className="w-4 h-4" /> {loading ? 'Checking…' : 'Track'}</button>
            {error && <p className="ow-error sm:col-span-3">{error}</p>}
          </form>

          {order && (
            <div className="ow-card p-6 space-y-6 animate-fade-up">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading font-bold text-xl text-white tracking-wider">{order.order_ref}</p>
                <p className="text-sm ow-muted">Placed {new Date(order.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>

              {order.status === 'rejected' ? (
                <p className="flex gap-2 items-start text-red-300"><XCircle className="w-5 h-5 shrink-0" /> This order was cancelled. Please WhatsApp us if you have questions.</p>
              ) : (
                <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
                  {STEPS.map((s, i) => {
                    const done = i <= stepIndex;
                    return (
                      <li key={s.id} className="flex flex-col items-center text-center gap-2">
                        <span className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${i === stepIndex ? 'animate-soft-pulse' : ''}`}
                          style={{ background: done ? 'linear-gradient(135deg,#00d4ff,#0284c7)' : 'rgba(255,255,255,0.06)' }} aria-current={i === stepIndex ? 'step' : undefined}>
                          <s.icon className={`w-5 h-5 ${done ? 'text-white' : 'ow-subtle'}`} />
                        </span>
                        <span className={`text-xs sm:text-sm ${done ? 'text-white font-medium' : 'ow-subtle'}`}>{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <ul className="text-sm space-y-1">
                {order.items.map((it) => <li key={it.product_id} className="flex justify-between"><span className="ow-muted">{it.quantity} × {it.name}</span></li>)}
                <li className="flex justify-between pt-2 font-semibold text-white" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><span>Total</span><span>{pkr(Number(order.total))}</span></li>
                {order.preferred_slot && <li className="ow-muted flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Preferred time: {SLOT[order.preferred_slot] ?? order.preferred_slot}</li>}
              </ul>

              {order.status === 'pending' && <ClosedNotice variant="card" />}

              <div className="flex flex-col sm:flex-row gap-3">
                {reorderable && <button className="ow-btn flex-1" onClick={reorder}><RotateCcw className="w-4 h-4" /> Order the same again</button>}
                <a className="ow-btn-whatsapp flex-1" target="_blank" rel="noopener noreferrer"
                  href={whatsappLink(settings.contact_info.whatsapp, `Assalam o Alaikum! Asking about my order ${order.order_ref}.`)}>
                  <WhatsAppIcon /> Ask about this order
                </a>
              </div>

              {order.google_review_url && (
                <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.25)' }}>
                  <p className="text-sm text-white flex gap-2"><Star className="w-5 h-5 text-yellow-300 shrink-0" /> Happy with your water? A Google review helps other families in Gujranwala find us.</p>
                  <a href={order.google_review_url} target="_blank" rel="noopener noreferrer" className="ow-btn-ghost !py-2 text-sm shrink-0">Leave a review</a>
                </div>
              )}

              {order.customer?.referral_code && settings.referral.enabled && (
                <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <p className="text-sm text-white flex gap-2"><Gift className="w-5 h-5 text-emerald-300 shrink-0" />
                    Share your code: friends get {pkr(settings.referral.new_customer_discount)} off their first order, and you get {pkr(settings.referral.referrer_credit)} credit when it's delivered.
                  </p>
                  <div className="flex gap-2 items-center">
                    <code className="font-mono font-bold tracking-widest text-emerald-300 px-3 py-2 rounded-lg border border-dashed border-emerald-400/40">{order.customer.referral_code}</code>
                    <button className="ow-btn-ghost !p-2" aria-label="Copy code" onClick={() => { navigator.clipboard?.writeText(order.customer!.referral_code!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a className="ow-btn-whatsapp !py-2 !px-4 text-sm" target="_blank" rel="noopener noreferrer"
                      href={`https://wa.me/?text=${encodeURIComponent(`I order my drinking water from One Water in Gujranwala. Use my code ${order.customer.referral_code} for ${pkr(settings.referral.new_customer_discount)} off your first order: https://www.onewaterpakistan.com/products`)}`}>
                      <WhatsAppIcon className="w-4 h-4" /> Share
                    </a>
                  </div>
                  {order.customer.referral_credit > 0 && <p className="text-xs text-emerald-200">You have {pkr(order.customer.referral_credit)} credit — it's applied automatically to your next order.</p>}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm ow-muted">Lost your order number? <a className="ow-cyan hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, 'Assalam o Alaikum! I need help finding my order.')}>WhatsApp us</a> or <Link to="/contact" className="ow-cyan hover:underline">contact us</Link>.</p>
        </div>
      </section>
    </div>
  );
}
