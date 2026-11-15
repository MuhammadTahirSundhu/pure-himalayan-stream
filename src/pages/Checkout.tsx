import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, CreditCard, User, ClipboardCheck, Copy, Check, Lock, AlertTriangle, Tag, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import { api, ApiError } from '@/lib/api';
import { pkr } from '@/lib/pricing';
import type { Quote } from '@/lib/types';
import TrustRow from '@/components/site/TrustRow';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';
import WaitlistForm from '@/components/site/WaitlistForm';
import Seo from '@/components/site/Seo';

const STEPS = [
  { id: 1, label: 'Details', icon: User },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirm', icon: ClipboardCheck },
];
const SCHEDULE_LABEL = { once: 'One-time', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' } as const;
const PHONE_RE = /^(\+?92|0)?3\d{2}[\s-]?\d{7}$/;
const MAX_SCREENSHOT = 5 * 1024 * 1024;
const LAST_ORDER_KEY = 'ow_last_order';

interface PlacedOrder { order_ref: string; total: number; deposit_total: number; payment: string; summary: string }

const readLastOrder = (): PlacedOrder | null => {
  try { return JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null'); } catch { return null; }
};

export default function Checkout() {
  const { items, promo, applyPromo, removePromo, schedule, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const cities = settings.service_areas.cities;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: cities[0] ?? '', area: '', street: '', note: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotError, setScreenshotError] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [placed, setPlaced] = useState<PlacedOrder | null>(readLastOrder);
  const [copied, setCopied] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const outsideArea = form.city === '__other';
  const account = settings.payment_accounts.find((a) => a.id === paymentMethod);
  const hasDispenser = items.some((i) => i.category === 'dispenser');

  const fieldErrors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a mobile number like 0300 1234567.';
    if (!form.city || outsideArea) e.city = 'Please choose your city.';
    if (form.street.trim().length < 3) e.street = 'Please enter your house / street address.';
    return e;
  }, [form, outsideArea]);
  const err = (k: string) => (touched[k] && fieldErrors[k]) || serverErrors[k];

  // Server quote is the source of truth for every amount shown on step 3.
  useEffect(() => {
    if (step !== 3 || !items.length) return;
    let cancelled = false;
    setQuoteError('');
    api<Quote>('/api/orders/quote', {
      method: 'POST',
      json: { items: items.map((i) => ({ id: i.id, quantity: i.quantity, new_bottles: i.newBottles })), promo_code: promo?.code, phone: form.phone },
    })
      .then((q) => { if (!cancelled) setQuote(q); })
      .catch((e) => { if (!cancelled) setQuoteError(e instanceof ApiError ? e.message : 'Could not price your order.'); });
    return () => { cancelled = true; };
  }, [step, items, promo, form.phone]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const goToPayment = () => {
    setTouched({ name: true, phone: true, city: true, street: true });
    if (!Object.keys(fieldErrors).length) setStep(2);
  };

  const pickScreenshot = (file: File | null) => {
    setScreenshotError('');
    if (!file) return setScreenshot(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setScreenshotError('Please upload a JPG, PNG or WebP image.');
    if (file.size > MAX_SCREENSHOT) return setScreenshotError('Image is larger than 5 MB. Please send a smaller screenshot.');
    setScreenshot(file);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const e = await applyPromo(promoInput.trim());
    setPromoError(e ?? '');
    if (!e) setPromoInput('');
  };

  const placeOrder = async () => {
    setSubmitting(true); setSubmitError(''); setServerErrors({});
    try {
      let screenshot_url: string | undefined;
      if (paymentMethod !== 'cod') {
        if (!screenshot) throw new ApiError(422, 'Please upload your payment screenshot.');
        const fd = new FormData();
        fd.append('screenshot', screenshot);
        screenshot_url = (await api<{ url: string }>('/api/orders/screenshot', { method: 'POST', body: fd })).url;
      }
      const res = await api<{ order_ref: string; total: number; deposit_total: number }>('/api/orders', {
        method: 'POST',
        json: {
          customer_name: form.name.trim(), phone: form.phone.trim(), city: form.city, area: form.area.trim(), street: form.street.trim(),
          customer_note: form.note.trim() || undefined, payment_method: paymentMethod, screenshot_url,
          promo_code: quote?.promo_code || undefined, delivery_schedule: hasDispenser ? schedule : undefined,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity, new_bottles: i.newBottles })),
        },
      });
      const summary = items.map((i) => `${i.quantity} × ${i.name}`).join(', ');
      const order: PlacedOrder = { order_ref: res.order_ref, total: res.total, deposit_total: res.deposit_total, payment: account?.label ?? 'Cash on delivery', summary };
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      setPlaced(order);
      clearCart();
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.message);
        if (Object.keys(e.fieldErrors).length) { setServerErrors(e.fieldErrors); setStep(1); }
      } else setSubmitError('Something went wrong. Please try again or WhatsApp us.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────
  if (placed && !items.length) {
    const waText = `Assalam o Alaikum! I just placed order ${placed.order_ref} (${placed.summary}) — total ${pkr(placed.total)}, paying by ${placed.payment}. Please confirm my delivery time.`;
    return (
      <div className="ow-page py-16">
        <Seo title="Order placed | One Water" description="Your One Water order has been placed." path="/checkout" noindex />
        <div className="container mx-auto px-4 max-w-xl">
          <div className="ow-card p-8 text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="font-heading font-black text-3xl text-white mb-2">Order placed — shukriya!</h1>
            <p className="ow-muted mb-6">Your order reference is</p>
            <p className="font-heading font-bold text-2xl tracking-widest ow-cyan mb-6">{placed.order_ref}</p>
            <ol className="text-left space-y-3 mb-8 text-sm">
              {[
                'Tap the button below to send your order to us on WhatsApp — it’s the fastest way to confirm.',
                'We’ll confirm your delivery time and address.',
                `Your water arrives at your door. ${placed.payment === 'Cash on delivery' ? `Pay ${pkr(placed.total)} to the rider.` : 'We verify your payment screenshot before dispatch.'}`,
              ].map((t, i) => (
                <li key={i} className="flex gap-3"><span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#00d4ff,#0284c7)' }}>{i + 1}</span><span className="ow-muted">{t}</span></li>
              ))}
            </ol>
            <div className="flex flex-col gap-3">
              <a href={whatsappLink(settings.contact_info.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp"><WhatsAppIcon /> Confirm on WhatsApp</a>
              <button onClick={() => { sessionStorage.removeItem(LAST_ORDER_KEY); setPlaced(null); navigate('/'); }} className="ow-btn-ghost">Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="ow-page flex items-center justify-center py-24">
        <Seo title="Checkout | One Water" description="Checkout" path="/checkout" noindex />
        <div className="text-center px-4">
          <h1 className="font-heading font-bold text-3xl text-white mb-3">Your cart is empty</h1>
          <p className="ow-muted mb-6">Add some water to get started.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="ow-btn">Browse products</Link>
            <Link to="/delivery" className="ow-btn-ghost">Order 19L bottles</Link>
          </div>
        </div>
      </div>
    );
  }

  const inputProps = (k: keyof typeof form) => ({
    id: `co-${k}`, className: 'ow-input', value: form[k], 'aria-invalid': !!err(k),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setForm({ ...form, [k]: e.target.value }); setServerErrors((s) => ({ ...s, [k]: '' })); },
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  });

  return (
    <div className="ow-page py-12 md:py-16">
      <Seo title="Checkout | One Water" description="Complete your One Water order." path="/checkout" noindex />
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-heading font-black text-4xl text-center text-white mb-8">Checkout</h1>

        <ol className="flex items-center justify-center gap-2 mb-10" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className={`flex items-center gap-2 text-sm font-semibold ${step >= s.id ? 'text-white' : 'ow-subtle'}`} aria-current={step === s.id ? 'step' : undefined}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ background: step >= s.id ? 'linear-gradient(135deg,#00d4ff,#0284c7)' : 'rgba(255,255,255,0.06)', boxShadow: step === s.id ? '0 0 16px rgba(0,212,255,0.5)' : 'none' }}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
              {i < STEPS.length - 1 && <span className="w-8 sm:w-12 h-0.5 rounded" style={{ background: step > s.id ? '#00d4ff' : 'rgba(255,255,255,0.1)' }} />}
            </li>
          ))}
        </ol>

        {submitError && step !== 3 && <p className="mb-4 p-3 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/30">{submitError}</p>}

        {step === 1 && (
          <form className="ow-card p-6 space-y-4 animate-fade-up" onSubmit={(e) => { e.preventDefault(); goToPayment(); }} noValidate>
            <h2 className="font-heading font-bold text-xl text-white">Delivery details</h2>
            <div>
              <label className="ow-label" htmlFor="co-name">Full name</label>
              <input {...inputProps('name')} autoComplete="name" />
              {err('name') && <p className="ow-error">{err('name')}</p>}
            </div>
            <div>
              <label className="ow-label" htmlFor="co-phone">Mobile / WhatsApp number</label>
              <input {...inputProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" />
              {err('phone') && <p className="ow-error">{err('phone')}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ow-label" htmlFor="co-city">City</label>
                <select {...inputProps('city')}>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__other">Another city…</option>
                </select>
                {err('city') && !outsideArea && <p className="ow-error">{err('city')}</p>}
              </div>
              <div>
                <label className="ow-label" htmlFor="co-area">Area / colony</label>
                <input {...inputProps('area')} placeholder="e.g. Satellite Town" autoComplete="address-level3" />
              </div>
            </div>
            {outsideArea && (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <p className="text-sm text-amber-200 flex gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> We currently deliver in {cities.join(', ')} only — we're expanding soon. Leave your details and we'll message you when we reach your city.</p>
                <WaitlistForm />
              </div>
            )}
            <div>
              <label className="ow-label" htmlFor="co-street">House / street address</label>
              <input {...inputProps('street')} placeholder="House #, street, nearby landmark" autoComplete="street-address" />
              {err('street') && <p className="ow-error">{err('street')}</p>}
            </div>
            <div>
              <label className="ow-label" htmlFor="co-note">Note for delivery (optional)</label>
              <textarea {...inputProps('note')} rows={2} placeholder="e.g. Call before coming, 2nd floor" />
            </div>
            <button type="submit" className="ow-btn w-full" disabled={outsideArea}>Continue to payment</button>
          </form>
        )}

        {step === 2 && (
          <div className="ow-card p-6 space-y-4 animate-fade-up">
            <h2 className="font-heading font-bold text-xl text-white">How would you like to pay?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[{ id: 'cod', label: 'Cash on delivery', number: '', title: '' }, ...settings.payment_accounts].map((pm) => (
                <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)} aria-pressed={paymentMethod === pm.id}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{ border: `2px solid ${paymentMethod === pm.id ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, background: paymentMethod === pm.id ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <p className="font-semibold text-white">{pm.label}</p>
                  <p className="text-xs ow-muted mt-1">{pm.id === 'cod' ? 'Pay the rider when your water arrives' : 'Transfer now, upload the screenshot'}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="ow-btn-ghost">Back</button>
              <button onClick={() => setStep(3)} className="ow-btn flex-1">Review order</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <div className="ow-card p-6 space-y-3">
              <h2 className="font-heading font-bold text-xl text-white">Order summary</h2>
              {quoteError && <p className="text-sm text-red-300 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {quoteError}</p>}
              {!quote && !quoteError && <div className="h-24 rounded-xl bg-white/5 animate-pulse" />}
              {quote && (
                <dl className="space-y-2 text-sm">
                  {quote.lines.map((l) => (
                    <div key={l.product_id} className="flex justify-between gap-3">
                      <dt className="ow-muted">{l.product_name} <span className="ow-cyan">× {l.quantity}</span></dt>
                      <dd className="text-white">{pkr(l.line_total)}</dd>
                    </div>
                  ))}
                  {quote.discount > 0 && <div className="flex justify-between text-emerald-300"><dt>Promo {quote.promo_code}</dt><dd>−{pkr(quote.discount)}</dd></div>}
                  {quote.deposit_total > 0 && <div className="flex justify-between"><dt className="ow-muted">Refundable bottle deposit</dt><dd className="text-white">{pkr(quote.deposit_total)}</dd></div>}
                  <div className="flex justify-between"><dt className="ow-muted">Delivery</dt><dd className="text-white">{quote.delivery_fee ? pkr(quote.delivery_fee) : 'Free'}</dd></div>
                  <div className="flex justify-between font-heading font-bold text-xl pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><dt className="text-white">Total</dt><dd className="ow-cyan">{pkr(quote.total)}</dd></div>
                </dl>
              )}
              {quote?.promo_error && <p className="text-xs text-amber-300">{quote.promo_error}</p>}
              {promo ? (
                <p className="text-xs ow-muted flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> Code {promo.code} <button className="underline" onClick={removePromo}>remove</button></p>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input className="ow-input !py-2.5" placeholder="Have a promo code?" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-label="Promo code" />
                  <button className="ow-btn-ghost !py-2.5 text-sm" onClick={handleApplyPromo}>Apply</button>
                </div>
              )}
              {promoError && <p className="ow-error">{promoError}</p>}
              <div className="text-sm ow-muted pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p><span className="text-white">{form.name}</span> · {form.phone}</p>
                <p>{form.street}{form.area && `, ${form.area}`}, {form.city}</p>
                {hasDispenser && <p>19L delivery: {SCHEDULE_LABEL[schedule]}</p>}
                <button className="text-xs ow-cyan hover:underline mt-1" onClick={() => setStep(1)}>Edit details</button>
              </div>
            </div>

            {account && quote && (
              <div className="ow-card p-6 space-y-4">
                <h2 className="font-heading font-bold text-xl text-white">Pay with {account.label}</h2>
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <p className="text-sm ow-muted">Send <strong className="text-white">{pkr(quote.total)}</strong> to:</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-heading font-black text-3xl ow-cyan tracking-wider">{account.number}</p>
                    <button className="ow-btn-ghost !p-2" aria-label="Copy number" onClick={() => { navigator.clipboard?.writeText(account.number.replace(/\s/g, '')); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {account.title && <p className="text-sm ow-muted mt-1">Account title: <span className="text-white">{account.title}</span></p>}
                </div>
                <label htmlFor="screenshot" className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-cyan-400/5" style={{ borderColor: screenshot ? 'rgba(16,185,129,0.5)' : 'rgba(0,212,255,0.3)' }}>
                  <input id="screenshot" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickScreenshot(e.target.files?.[0] ?? null)} />
                  {screenshot ? <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" /> : <Upload className="w-8 h-8 mx-auto mb-2 ow-cyan" />}
                  <p className="text-sm text-white">{screenshot ? screenshot.name : 'Upload your payment screenshot'}</p>
                  <p className="text-xs ow-subtle mt-1">JPG, PNG or WebP · max 5 MB</p>
                </label>
                {screenshotError && <p className="ow-error">{screenshotError}</p>}
              </div>
            )}

            {submitError && <p className="p-3 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/30">{submitError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="ow-btn-ghost">Back</button>
              <button onClick={placeOrder} className="ow-btn flex-1 !py-4" disabled={submitting || !quote || (paymentMethod !== 'cod' && !screenshot)}>
                <Lock className="w-4 h-4" /> {submitting ? 'Placing order…' : quote ? `Place order · ${pkr(quote.total)}` : 'Place order'}
              </button>
            </div>
            <TrustRow compact className="justify-center" />
          </div>
        )}
      </div>
    </div>
  );
}
