import { useState } from 'react';
import { Calculator, Users, Sparkles, Tag, Building2, PartyPopper, CheckCircle2, Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { pkr } from '@/lib/pricing';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import { CardGrid, FeatureCard } from '@/components/site/Cards';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';

const EVENT_TYPES = [
  { id: 'office', label: 'Office / shop monthly supply', perGuest: 0 },
  { id: 'wedding', label: 'Wedding / Walima', perGuest: 3 },
  { id: 'corporate', label: 'Corporate / Office', perGuest: 2 },
  { id: 'religious', label: 'Religious gathering', perGuest: 2 },
  { id: 'school', label: 'School / Sports', perGuest: 2 },
  { id: 'other', label: 'Other', perGuest: 2 },
];

const EMPTY_FORM = { name: '', phone: '', email: '', event_date: '', event_location: '', bottle_size: '', quantity: '', notes: '' };

export default function Events() {
  const { data: products = [] } = useProducts();
  const { settings } = useSiteSettings();
  const bottles = products.filter((p) => p.category === 'bottle' && p.inStock);

  const [guests, setGuests] = useState(150);
  const [eventType, setEventType] = useState('wedding');
  const calcTypes = EVENT_TYPES.filter((t) => t.perGuest > 0);
  const [inquiryType, setInquiryType] = useState('wedding');
  const [sizeId, setSizeId] = useState('');
  const size = bottles.find((b) => b.id === sizeId) ?? bottles.find((b) => b.id === '500ml') ?? bottles[0];
  const perGuest = EVENT_TYPES.find((t) => t.id === eventType)?.perGuest ?? 2;
  const estimateBottles = guests * perGuest;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const applyEstimate = () => {
    setInquiryType(eventType);
    setForm((f) => ({
      ...f,
      bottle_size: size?.size ?? f.bottle_size,
      quantity: String(estimateBottles),
      notes: f.notes || `${EVENT_TYPES.find((t) => t.id === eventType)?.label}, about ${guests} guests.`,
    }));
    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setError(''); setErrors({});
    try {
      await api('/api/events', { method: 'POST', json: { ...form, event_type: EVENT_TYPES.find((t) => t.id === inquiryType)?.label } });
      setStatus('sent');
      trackEvent('generate_lead', { form: 'bulk_quote' });
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError) { setErrors(err.fieldErrors); setError(err.message); }
    }
  };

  const field = (k: keyof typeof EMPTY_FORM) => ({
    id: `ev-${k}`, className: 'ow-input', value: form[k], 'aria-invalid': !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className="ow-page">
      <Seo
        path="/events"
      />
      <PageHero
        eyebrow={<><Sparkles className="w-4 h-4" /> Events & Bulk Orders</>}
        title={<>Water for every <span className="ow-gradient-text">guest, desk & gathering</span></>}
        subtitle="Weddings, offices, schools, religious gatherings — tell us the size of your event and we'll handle the water."
      />

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 max-w-5xl">
          <div className="space-y-6">
            <Reveal className="ow-card p-6 space-y-5">
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2"><Calculator className="w-5 h-5 ow-cyan" /> Quick estimate</h2>
              <div>
                <label className="ow-label" htmlFor="ev-guests"><Users className="w-4 h-4 inline mr-1" /> Number of guests</label>
                <input id="ev-guests" type="number" min={1} max={20000} className="ow-input" value={guests} onChange={(e) => setGuests(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="ow-label" htmlFor="ev-type">Event type</label>
                  <select id="ev-type" className="ow-input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    {calcTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ow-label" htmlFor="ev-size">Bottle size</label>
                  <select id="ev-size" className="ow-input" value={size?.id ?? ''} onChange={(e) => setSizeId(e.target.value)} disabled={!bottles.length}>
                    {bottles.map((b) => <option key={b.id} value={b.id}>{b.size} — {pkr(b.price)}</option>)}
                    {!bottles.length && <option value="">Loading…</option>}
                  </select>
                </div>
              </div>
              <div className="rounded-xl p-5" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <p className="text-sm ow-muted">About <strong className="text-white">{estimateBottles.toLocaleString()} bottles</strong> ({perGuest} per guest)</p>
                {size && <p className="font-heading font-black text-3xl text-white mt-1">{pkr(estimateBottles * size.price)}</p>}
                <p className="text-xs ow-subtle mt-1">At regular prices. Bulk orders get a discounted quote — ask us.</p>
              </div>
              <button className="ow-btn w-full" onClick={applyEstimate} disabled={!guests}>Use this estimate in my inquiry</button>
            </Reveal>

            <CardGrid cols={2}>
              {[
                { icon: PartyPopper, title: 'Weddings & events', text: 'Bottles delivered to your venue before your guests arrive.' },
                { icon: Building2, title: 'Offices & schools', text: 'Regular 19L or bottle supply on a schedule that suits you.' },
              ].map(({ icon, title, text }) => <FeatureCard key={title} icon={icon} title={title}>{text}</FeatureCard>)}
            </CardGrid>

            <Reveal delay={150} className="ow-card p-6">
              <h3 className="font-heading font-bold text-white mb-2 flex items-center gap-2"><Tag className="w-5 h-5 ow-cyan" /> Custom labels</h3>
              <p className="text-sm ow-muted mb-4">Want your event name or company logo on the bottles? Ask us about custom labels and minimum quantities.</p>
              <a className="ow-btn-whatsapp !py-2.5 text-sm" target="_blank" rel="noopener noreferrer"
                href={whatsappLink(settings.contact_info.whatsapp, 'Hi One Water, I would like to ask about custom labels on bottles for my event.')}>
                <WhatsAppIcon className="w-4 h-4" /> Ask about custom labels
              </a>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div id="inquiry" className="scroll-mt-24">
              {status === 'sent' ? (
                <div className="ow-card p-8 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <h2 className="font-heading font-bold text-2xl text-white">Inquiry received!</h2>
                  <p className="ow-muted">We'll contact you on your phone / WhatsApp with a quote during business hours ({settings.contact_info.hours}).</p>
                  <button className="ow-btn-ghost" onClick={() => setStatus('idle')}>Send another inquiry</button>
                </div>
              ) : (
                <form onSubmit={submit} className="ow-card p-6 space-y-4" noValidate>
                  <h2 className="font-heading font-bold text-xl text-white">Get a bulk quote</h2>
                  <div>
                    <label className="ow-label" htmlFor="ev-inquiry-type">What do you need?</label>
                    <select id="ev-inquiry-type" className="ow-input" value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
                      {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ev-name">Your name *</label><input {...field('name')} autoComplete="name" />{errors.name && <p className="ow-error">{errors.name}</p>}</div>
                    <div><label className="ow-label" htmlFor="ev-phone">Phone / WhatsApp *</label><input {...field('phone')} type="tel" inputMode="tel" placeholder="0300 1234567" />{errors.phone && <p className="ow-error">{errors.phone}</p>}</div>
                  </div>
                  <div><label className="ow-label" htmlFor="ev-email">Email (optional)</label><input {...field('email')} type="email" autoComplete="email" />{errors.email && <p className="ow-error">{errors.email}</p>}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ev-event_date">Event date</label><input {...field('event_date')} type="date" style={{ colorScheme: 'dark' }} /></div>
                    <div><label className="ow-label" htmlFor="ev-event_location">Venue / area</label><input {...field('event_location')} placeholder="e.g. Marquee on GT Road" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="ow-label" htmlFor="ev-bottle_size">Bottle size</label>
                      <select {...field('bottle_size')}>
                        <option value="">Not sure yet</option>
                        {products.filter((p) => p.inStock).map((p) => <option key={p.id} value={p.size}>{p.size}</option>)}
                      </select>
                    </div>
                    <div><label className="ow-label" htmlFor="ev-quantity">Quantity</label><input {...field('quantity')} inputMode="numeric" placeholder="e.g. 300" /></div>
                  </div>
                  <div><label className="ow-label" htmlFor="ev-notes">Anything else?</label><textarea {...field('notes')} rows={3} placeholder="Delivery time, custom labels, etc." /></div>
                  {error && !Object.keys(errors).length && <p className="ow-error">{error}</p>}
                  <button className="ow-btn w-full" disabled={status === 'sending'}><Send className="w-4 h-4" /> {status === 'sending' ? 'Sending…' : 'Request my quote'}</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal className="ow-card p-6 md:p-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <span className="ow-eyebrow"><Building2 className="w-4 h-4" /> Offices, shops & schools</span>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white mt-4 mb-3">Regular water for your workplace</h2>
              <p className="ow-muted mb-5">Set it once and stop worrying about running out. Tell us how many people you have and we'll suggest a plan.</p>
              <ul className="space-y-2 text-sm">
                {['A fixed delivery day each week', 'Swap your empties — pay only for the water', 'One WhatsApp contact for orders and changes', 'Ask us about monthly billing and dispensers'].map((t) => (
                  <li key={t} className="flex gap-2 text-white/90"><span className="ow-cyan">✓</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button className="ow-btn" onClick={() => { setInquiryType('office'); document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Request an office plan</button>
              <a className="ow-btn-whatsapp" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, 'Assalam o Alaikum! I would like regular water delivery for my office/shop.')}><WhatsAppIcon /> Discuss on WhatsApp</a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
