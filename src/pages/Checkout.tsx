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
import ClosedNotice from '@/components/site/ClosedNotice';
import { saveLastOrder } from '@/lib/lastOrder';
import { trackEvent } from '@/lib/analytics';
import { useLang } from '@/contexts/LanguageContext';

type T = (en: string, ur: string) => string;
const buildSteps = (t: T) => [
  { id: 1, label: t('Details', 'تفصیلات'), icon: User },
  { id: 2, label: t('Payment', 'ادائیگی'), icon: CreditCard },
  { id: 3, label: t('Confirm', 'تصدیق'), icon: ClipboardCheck },
];
const buildSlots = (t: T) => [
  { id: 'any', label: t('Any time', 'کسی بھی وقت') },
  { id: 'morning', label: t('Morning (9–12)', 'صبح (9 تا 12)') },
  { id: 'afternoon', label: t('Afternoon (12–4)', 'دوپہر (12 تا 4)') },
  { id: 'evening', label: t('Evening (4–7)', 'شام (4 تا 7)') },
];
const buildScheduleLabel = (t: T) => ({ once: t('One-time', 'ایک بار'), weekly: t('Weekly', 'ہر ہفتے'), biweekly: t('Every 2 weeks', 'ہر دو ہفتے'), monthly: t('Monthly', 'ہر مہینے') });
const PHONE_RE = /^(\+?92|0)?3\d{2}[\s-]?\d{7}$/;
const MAX_SCREENSHOT = 5 * 1024 * 1024;
const LAST_ORDER_KEY = 'ow_last_order';

interface PlacedOrder { order_ref: string; total: number; deposit_total: number; payment: string; summary: string; cod?: boolean }

const readLastOrder = (): PlacedOrder | null => {
  try { return JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null'); } catch { return null; }
};

export default function Checkout() {
  const { items, promo, applyPromo, removePromo, schedule, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const { t, isUrdu } = useLang();
  const STEPS = buildSteps(t);
  const SLOTS = buildSlots(t);
  const SCHEDULE_LABEL = buildScheduleLabel(t);
  const cities = settings.service_areas.cities;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: cities[0] ?? '', area: '', street: '', note: '', slot: 'any' });
  const [referralInput, setReferralInput] = useState('');
  const [referralCode, setReferralCode] = useState('');
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
    if (form.name.trim().length < 2) e.name = t('Please enter your full name.', 'براہِ کرم اپنا پورا نام لکھیں۔');
    if (!PHONE_RE.test(form.phone.trim())) e.phone = t('Enter a mobile number like 0300 1234567.', 'موبائل نمبر اس طرح لکھیں: \u20660300 1234567\u2069');
    if (!form.city || outsideArea) e.city = t('Please choose your city.', 'براہِ کرم اپنا شہر منتخب کریں۔');
    if (form.street.trim().length < 3) e.street = t('Please enter your house / street address.', 'براہِ کرم اپنے گھر / گلی کا پتہ لکھیں۔');
    return e;
  }, [form, outsideArea, t]);
  const err = (k: string) => (touched[k] && fieldErrors[k]) || serverErrors[k];

  // Server quote is the source of truth for every amount shown on step 3.
  useEffect(() => {
    if (step !== 3 || !items.length) return;
    let cancelled = false;
    setQuoteError('');
    api<Quote>('/api/orders/quote', {
      method: 'POST',
      json: { items: items.map((i) => ({ id: i.id, quantity: i.quantity, new_bottles: i.newBottles })), promo_code: promo?.code, referral_code: referralCode || undefined, phone: form.phone },
    })
      .then((q) => { if (!cancelled) setQuote(q); })
      .catch((e) => { if (!cancelled) setQuoteError(e instanceof ApiError ? e.message : t('Could not price your order.', 'آپ کے آرڈر کی قیمت معلوم نہیں ہو سکی۔')); });
    return () => { cancelled = true; };
  }, [step, items, promo, form.phone, referralCode]); // eslint-disable-line react-hooks/exhaustive-deps -- t only affects the fallback error text

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);
  useEffect(() => { if (items.length) trackEvent('begin_checkout', { currency: 'PKR', items: items.map((i) => ({ item_id: i.id, quantity: i.quantity })) }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPayment = () => {
    setTouched({ name: true, phone: true, city: true, street: true });
    if (!Object.keys(fieldErrors).length) setStep(2);
  };

  const pickScreenshot = (file: File | null) => {
    setScreenshotError('');
    if (!file) return setScreenshot(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setScreenshotError(t('Please upload a JPG, PNG or WebP image.', 'براہِ کرم JPG، PNG یا WebP تصویر اپ لوڈ کریں۔'));
    if (file.size > MAX_SCREENSHOT) return setScreenshotError(t('Image is larger than 5 MB. Please send a smaller screenshot.', 'تصویر 5 MB سے بڑی ہے۔ براہِ کرم چھوٹا اسکرین شاٹ بھیجیں۔'));
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
        if (!screenshot) throw new ApiError(422, t('Please upload your payment screenshot.', 'براہِ کرم ادائیگی کا اسکرین شاٹ اپ لوڈ کریں۔'));
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
          referral_code: quote?.referral_code || undefined, preferred_slot: form.slot,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity, new_bottles: i.newBottles })),
        },
      });
      const summary = items.map((i) => `${i.quantity} × ${i.name}`).join(', ');
      const order: PlacedOrder = { order_ref: res.order_ref, total: res.total, deposit_total: res.deposit_total, payment: account?.label ?? 'Cash on delivery', summary, cod: !account };
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      saveLastOrder({ order_ref: res.order_ref, phone: form.phone.trim(), placed_at: new Date().toISOString(), items: items.map((i) => ({ id: i.id, quantity: i.quantity })), schedule: hasDispenser ? schedule : undefined });
      trackEvent('purchase', { transaction_id: res.order_ref, value: res.total, currency: 'PKR', payment_method: paymentMethod });
      setPlaced(order);
      clearCart();
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.message);
        if (Object.keys(e.fieldErrors).length) { setServerErrors(e.fieldErrors); setStep(1); }
      } else setSubmitError(t('Something went wrong. Please try again or WhatsApp us.', 'کچھ گڑبڑ ہو گئی۔ دوبارہ کوشش کریں یا ہمیں واٹس ایپ کریں۔'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────
  if (placed && !items.length) {
    const placedCod = placed.cod ?? placed.payment === 'Cash on delivery';
    const paymentLabel = placedCod ? t('Cash on delivery', 'کیش آن ڈیلیوری') : placed.payment;
    const waText = t(
      `Assalam o Alaikum! I just placed order ${placed.order_ref} (${placed.summary}) — total ${pkr(placed.total)}, paying by ${placed.payment}. Please confirm my delivery time.`,
      `السلام علیکم! میں نے ابھی آرڈر ${placed.order_ref} دیا ہے (${placed.summary}) — کل رقم ${pkr(placed.total)}، ادائیگی ${paymentLabel} سے۔ براہِ کرم میری ڈیلیوری کا وقت کنفرم کر دیں۔`,
    );
    return (
      <div className="ow-page py-16">
        <Seo title="Order placed | One Water" description="Your One Water order has been placed." path="/checkout" noindex />
        <div className="container mx-auto px-4 max-w-xl">
          <div className="ow-card p-8 text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="font-heading font-black text-3xl text-white mb-2">{t('Order placed — shukriya!', 'آرڈر ہو گیا — شکریہ!')}</h1>
            <p className="ow-muted mb-6">{t('Your order reference is', 'آپ کا آرڈر نمبر ہے')}</p>
            <p className="font-heading font-bold text-2xl tracking-widest ow-cyan mb-6" dir="ltr">{placed.order_ref}</p>
            <ol className="text-start space-y-3 mb-8 text-sm">
              {[
                t('Tap the button below to send your order to us on WhatsApp — it’s the fastest way to confirm.', 'نیچے والا بٹن دبا کر اپنا آرڈر ہمیں واٹس ایپ پر بھیجیں — کنفرم کرنے کا یہ سب سے تیز طریقہ ہے۔'),
                t('We’ll confirm your delivery time and address.', 'ہم آپ کی ڈیلیوری کا وقت اور پتہ کنفرم کریں گے۔'),
                placedCod
                  ? t(`Your water arrives at your door. Pay ${pkr(placed.total)} to the rider.`, `پانی آپ کے دروازے پر پہنچ جائے گا۔ رائیڈر کو \u2066${pkr(placed.total)}\u2069 ادا کریں۔`)
                  : t('Your water arrives at your door. We verify your payment screenshot before dispatch.', 'پانی آپ کے دروازے پر پہنچ جائے گا۔ روانگی سے پہلے ہم آپ کی ادائیگی کا اسکرین شاٹ چیک کرتے ہیں۔'),
              ].map((line, i) => (
                <li key={i} className="flex gap-3"><span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#00d4ff,#0284c7)' }}>{i + 1}</span><span className="ow-muted">{line}</span></li>
              ))}
            </ol>
            <div className="mb-6 text-start"><ClosedNotice variant="card" /></div>
            <div className="flex flex-col gap-3">
              <a href={whatsappLink(settings.contact_info.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp"><WhatsAppIcon /> {t('Confirm on WhatsApp', 'واٹس ایپ پر کنفرم کریں')}</a>
              <Link to={`/track?ref=${placed.order_ref}`} className="ow-btn-ghost">{t('Track this order', 'یہ آرڈر ٹریک کریں')}</Link>
              <button onClick={() => { sessionStorage.removeItem(LAST_ORDER_KEY); setPlaced(null); navigate('/'); }} className="ow-btn-ghost">{t('Back to home', 'واپس ہوم پیج پر')}</button>
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
          <h1 className="font-heading font-bold text-3xl text-white mb-3">{t('Your cart is empty', 'آپ کا کارٹ خالی ہے')}</h1>
          <p className="ow-muted mb-6">{t('Add some water to get started.', 'شروع کرنے کے لیے کچھ پانی شامل کریں۔')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="ow-btn">{t('Browse products', 'پراڈکٹس دیکھیں')}</Link>
            <Link to="/delivery" className="ow-btn-ghost">{t('Order 19L bottles', '19 لیٹر بوتلیں آرڈر کریں')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const inputProps = (k: keyof typeof form) => ({
    id: `co-${k}`, className: 'ow-input', value: form[k], 'aria-invalid': !!err(k),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setForm({ ...form, [k]: e.target.value }); setServerErrors((s) => ({ ...s, [k]: '' })); },
    onBlur: () => setTouched((prev) => ({ ...prev, [k]: true })),
  });

  return (
    <div className="ow-page py-12 md:py-16">
      <Seo title="Checkout | One Water" description="Complete your One Water order." path="/checkout" noindex />
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-heading font-black text-4xl text-center text-white mb-8">{t('Checkout', 'چیک آؤٹ')}</h1>

        <ol className="flex items-center justify-center gap-2 mb-10" aria-label={t('Checkout progress', 'چیک آؤٹ کی پیش رفت')}>
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
            <h2 className="font-heading font-bold text-xl text-white">{t('Delivery details', 'ڈیلیوری کی تفصیلات')}</h2>
            <div>
              <label className="ow-label" htmlFor="co-name">{t('Full name', 'پورا نام')}</label>
              <input {...inputProps('name')} autoComplete="name" />
              {err('name') && <p className="ow-error">{err('name')}</p>}
            </div>
            <div>
              <label className="ow-label" htmlFor="co-phone">{t('Mobile / WhatsApp number', 'موبائل / واٹس ایپ نمبر')}</label>
              <input {...inputProps('phone')} dir="ltr" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" />
              {err('phone') && <p className="ow-error">{err('phone')}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ow-label" htmlFor="co-city">{t('City', 'شہر')}</label>
                <select {...inputProps('city')}>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__other">{t('Another city…', 'کوئی اور شہر…')}</option>
                </select>
                {err('city') && !outsideArea && <p className="ow-error">{err('city')}</p>}
              </div>
              <div>
                <label className="ow-label" htmlFor="co-area">{t('Area / colony', 'علاقہ / کالونی')}</label>
                <input {...inputProps('area')} placeholder={t('e.g. Satellite Town', 'مثلاً سیٹلائٹ ٹاؤن')} autoComplete="address-level3" />
              </div>
            </div>
            {outsideArea && (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <p className="text-sm text-amber-200 flex gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {t(`We currently deliver in ${cities.join(', ')} only — we're expanding soon. Leave your details and we'll message you when we reach your city.`, `ابھی ہم صرف ${cities.join('، ')} میں ڈیلیوری کرتے ہیں — جلد مزید شہروں میں آ رہے ہیں۔ اپنی تفصیلات چھوڑ دیں، آپ کے شہر پہنچتے ہی ہم آپ کو میسج کر دیں گے۔`)}</p>
                <WaitlistForm />
              </div>
            )}
            <div>
              <label className="ow-label" htmlFor="co-street">{t('House / street address', 'گھر / گلی کا پتہ')}</label>
              <input {...inputProps('street')} placeholder={t('House #, street, nearby landmark', 'مکان نمبر، گلی، قریبی نشانی')} autoComplete="street-address" />
              {err('street') && <p className="ow-error">{err('street')}</p>}
            </div>
            <div>
              <label className="ow-label" htmlFor="co-note">{t('Note for delivery (optional)', 'ڈیلیوری کے لیے ہدایت (اختیاری)')}</label>
              <textarea {...inputProps('note')} rows={2} placeholder={t('e.g. Call before coming, 2nd floor', 'مثلاً آنے سے پہلے کال کریں، دوسری منزل')} />
            </div>
            <div>
              <span className="ow-label">{t('Preferred delivery time', 'ڈیلیوری کا پسندیدہ وقت')}</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SLOTS.map((sl) => (
                  <button key={sl.id} type="button" onClick={() => setForm({ ...form, slot: sl.id })} aria-pressed={form.slot === sl.id}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                    style={{ background: form.slot === sl.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.slot === sl.id ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: form.slot === sl.id ? '#fff' : 'rgba(150,200,255,0.75)' }}>
                    {sl.label}
                  </button>
                ))}
              </div>
            </div>
            <ClosedNotice variant="card" />
            <button type="submit" className="ow-btn w-full" disabled={outsideArea}>{t('Continue to payment', 'ادائیگی کی طرف بڑھیں')}</button>
          </form>
        )}

        {step === 2 && (
          <div className="ow-card p-6 space-y-4 animate-fade-up">
            <h2 className="font-heading font-bold text-xl text-white">{t('How would you like to pay?', 'آپ کیسے ادائیگی کرنا چاہیں گے؟')}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[{ id: 'cod', label: t('Cash on delivery', 'کیش آن ڈیلیوری'), number: '', title: '' }, ...settings.payment_accounts].map((pm) => (
                <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)} aria-pressed={paymentMethod === pm.id}
                  className="p-4 rounded-xl text-start transition-all"
                  style={{ border: `2px solid ${paymentMethod === pm.id ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, background: paymentMethod === pm.id ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <p className="font-semibold text-white">{pm.label}</p>
                  <p className="text-xs ow-muted mt-1">{pm.id === 'cod' ? t('Pay the rider when your water arrives', 'پانی پہنچنے پر رائیڈر کو ادائیگی کریں') : t('Transfer now, upload the screenshot', 'ابھی رقم بھیجیں، اسکرین شاٹ اپ لوڈ کریں')}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="ow-btn-ghost">{t('Back', 'واپس')}</button>
              <button onClick={() => setStep(3)} className="ow-btn flex-1">{t('Review order', 'آرڈر دیکھیں')}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <div className="ow-card p-6 space-y-3">
              <h2 className="font-heading font-bold text-xl text-white">{t('Order summary', 'آرڈر کا خلاصہ')}</h2>
              {quoteError && <p className="text-sm text-red-300 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {quoteError}</p>}
              {!quote && !quoteError && <div className="h-24 rounded-xl bg-white/5 animate-pulse" />}
              {quote && (
                <dl className="space-y-2 text-sm">
                  {quote.lines.map((l) => (
                    <div key={l.product_id} className="flex justify-between gap-3">
                      <dt className="ow-muted">{l.product_name} <span className="ow-cyan" dir="ltr">× {l.quantity}</span></dt>
                      <dd className="text-white" dir="ltr">{pkr(l.line_total)}</dd>
                    </div>
                  ))}
                  {quote.discount > 0 && <div className="flex justify-between text-emerald-300"><dt>{t('Promo', 'پرومو')} <span dir="ltr">{quote.promo_code}</span></dt><dd dir="ltr">−{pkr(quote.discount)}</dd></div>}
                  {quote.referral_discount > 0 && <div className="flex justify-between text-emerald-300"><dt>{t('Referral', 'ریفرل')} <span dir="ltr">{quote.referral_code}</span></dt><dd dir="ltr">−{pkr(quote.referral_discount)}</dd></div>}
                  {quote.credit_applied > 0 && <div className="flex justify-between text-emerald-300"><dt>{t('Your referral credit', 'آپ کا ریفرل کریڈٹ')}</dt><dd dir="ltr">−{pkr(quote.credit_applied)}</dd></div>}
                  {quote.deposit_total > 0 && <div className="flex justify-between"><dt className="ow-muted">{t('Refundable bottle deposit', 'بوتل کی قابلِ واپسی سیکیورٹی')}</dt><dd className="text-white" dir="ltr">{pkr(quote.deposit_total)}</dd></div>}
                  <div className="flex justify-between"><dt className="ow-muted">{t('Delivery', 'ڈیلیوری')}</dt><dd className="text-white">{quote.delivery_fee ? <span dir="ltr">{pkr(quote.delivery_fee)}</span> : t('Free', 'فری')}</dd></div>
                  <div className="flex justify-between font-heading font-bold text-xl pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><dt className="text-white">{t('Total', 'کل رقم')}</dt><dd className="ow-cyan" dir="ltr">{pkr(quote.total)}</dd></div>
                </dl>
              )}
              {quote?.promo_error && <p className="text-xs text-amber-300">{quote.promo_error}</p>}
              {promo ? (
                <p className="text-xs ow-muted flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> {t('Code', 'کوڈ')} <span dir="ltr">{promo.code}</span> <button className="underline" onClick={removePromo}>{t('remove', 'ہٹائیں')}</button></p>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input className="ow-input !py-2.5" placeholder={t('Have a promo code?', 'پرومو کوڈ ہے؟')} value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-label={t('Promo code', 'پرومو کوڈ')} />
                  <button className="ow-btn-ghost !py-2.5 text-sm" onClick={handleApplyPromo}>{t('Apply', 'لگائیں')}</button>
                </div>
              )}
              {promoError && <p className="ow-error">{promoError}</p>}
              {settings.referral.enabled && !promo && (
                referralCode && !quote?.referral_error ? (
                  <p className="text-xs ow-muted">{t('Referral code', 'ریفرل کوڈ')} <span dir="ltr">{referralCode}</span> <button className="underline" onClick={() => setReferralCode('')}>{t('remove', 'ہٹائیں')}</button></p>
                ) : (
                  <div className="flex gap-2">
                    <input className="ow-input !py-2.5 uppercase" placeholder={t('Referral code from a friend?', 'کسی دوست کا ریفرل کوڈ ہے؟')} value={referralInput} onChange={(e) => setReferralInput(e.target.value)} aria-label={t('Referral code', 'ریفرل کوڈ')} />
                    <button className="ow-btn-ghost !py-2.5 text-sm" onClick={() => setReferralCode(referralInput.trim().toUpperCase())}>{t('Apply', 'لگائیں')}</button>
                  </div>
                )
              )}
              {quote?.referral_error && <p className="ow-error">{quote.referral_error}</p>}
              <div className="text-sm ow-muted pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p><span className="text-white">{form.name}</span> · <span dir="ltr">{form.phone}</span></p>
                <p>{form.street}{form.area && `${t(',', '،')} ${form.area}`}{t(',', '،')} {form.city}</p>
                {hasDispenser && <p>{t('19L delivery:', '19 لیٹر ڈیلیوری:')} {SCHEDULE_LABEL[schedule]}</p>}
                <p>{t('Preferred time:', 'پسندیدہ وقت:')} {SLOTS.find((sl) => sl.id === form.slot)?.label}</p>
                <button className="text-xs ow-cyan hover:underline mt-1" onClick={() => setStep(1)}>{t('Edit details', 'تفصیلات بدلیں')}</button>
              </div>
            </div>

            {account && quote && (
              <div className="ow-card p-6 space-y-4">
                <h2 className="font-heading font-bold text-xl text-white">{t(`Pay with ${account.label}`, `${account.label} سے ادائیگی کریں`)}</h2>
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <p className="text-sm ow-muted">{isUrdu
                    ? <><strong className="text-white" dir="ltr">{pkr(quote.total)}</strong> اس نمبر پر بھیجیں:</>
                    : <>Send <strong className="text-white">{pkr(quote.total)}</strong> to:</>}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-heading font-black text-3xl ow-cyan tracking-wider" dir="ltr">{account.number}</p>
                    <button className="ow-btn-ghost !p-2" aria-label={t('Copy number', 'نمبر کاپی کریں')} onClick={() => { navigator.clipboard?.writeText(account.number.replace(/\s/g, '')); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {account.title && <p className="text-sm ow-muted mt-1">{t('Account title:', 'اکاؤنٹ ٹائٹل:')} <span className="text-white">{account.title}</span></p>}
                </div>
                <label htmlFor="screenshot" className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-cyan-400/5" style={{ borderColor: screenshot ? 'rgba(16,185,129,0.5)' : 'rgba(0,212,255,0.3)' }}>
                  <input id="screenshot" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickScreenshot(e.target.files?.[0] ?? null)} />
                  {screenshot ? <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" /> : <Upload className="w-8 h-8 mx-auto mb-2 ow-cyan" />}
                  <p className="text-sm text-white">{screenshot ? <span dir="ltr">{screenshot.name}</span> : t('Upload your payment screenshot', 'ادائیگی کا اسکرین شاٹ اپ لوڈ کریں')}</p>
                  <p className="text-xs ow-subtle mt-1">{t('JPG, PNG or WebP · max 5 MB', 'JPG، PNG یا WebP · زیادہ سے زیادہ 5 MB')}</p>
                </label>
                {screenshotError && <p className="ow-error">{screenshotError}</p>}
              </div>
            )}

            {submitError && <p className="p-3 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/30">{submitError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="ow-btn-ghost">{t('Back', 'واپس')}</button>
              <button onClick={placeOrder} className="ow-btn flex-1 !py-4" disabled={submitting || !quote || (paymentMethod !== 'cod' && !screenshot)}>
                <Lock className="w-4 h-4" /> {submitting ? t('Placing order…', 'آرڈر ہو رہا ہے…') : quote ? <>{t('Place order', 'آرڈر کریں')} · <span dir="ltr">{pkr(quote.total)}</span></> : t('Place order', 'آرڈر کریں')}
              </button>
            </div>
            <TrustRow compact className="justify-center" />
          </div>
        )}
      </div>
    </div>
  );
}
