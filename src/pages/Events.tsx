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
import { useLang } from '@/contexts/LanguageContext';

// `en` is what we send to the API (the team reads inquiries in English); `label` is shown to the visitor.
const buildEventTypes = (t: (en: string, ur: string) => string) => [
  { id: 'office', en: 'Office / shop monthly supply', label: t('Office / shop monthly supply', 'دفتر / دکان کی ماہانہ سپلائی'), perGuest: 0 },
  { id: 'wedding', en: 'Wedding / Walima', label: t('Wedding / Walima', 'شادی / ولیمہ'), perGuest: 3 },
  { id: 'corporate', en: 'Corporate / Office', label: t('Corporate / Office', 'کارپوریٹ / دفتر'), perGuest: 2 },
  { id: 'religious', en: 'Religious gathering', label: t('Religious gathering', 'مذہبی اجتماع'), perGuest: 2 },
  { id: 'school', en: 'School / Sports', label: t('School / Sports', 'اسکول / کھیل'), perGuest: 2 },
  { id: 'other', en: 'Other', label: t('Other', 'دیگر'), perGuest: 2 },
];

const EMPTY_FORM = { name: '', phone: '', email: '', event_date: '', event_location: '', bottle_size: '', quantity: '', notes: '' };

export default function Events() {
  const { data: products = [] } = useProducts();
  const { settings } = useSiteSettings();
  const { t, isUrdu } = useLang();
  const EVENT_TYPES = buildEventTypes(t);
  const bottles = products.filter((p) => p.category === 'bottle' && p.inStock);

  const [guests, setGuests] = useState(150);
  const [eventType, setEventType] = useState('wedding');
  const calcTypes = EVENT_TYPES.filter((et) => et.perGuest > 0);
  const [inquiryType, setInquiryType] = useState('wedding');
  const [sizeId, setSizeId] = useState('');
  const size = bottles.find((b) => b.id === sizeId) ?? bottles.find((b) => b.id === '500ml') ?? bottles[0];
  const perGuest = EVENT_TYPES.find((et) => et.id === eventType)?.perGuest ?? 2;
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
      notes: f.notes || t(`${EVENT_TYPES.find((et) => et.id === eventType)?.label}, about ${guests} guests.`, `${EVENT_TYPES.find((et) => et.id === eventType)?.label}، تقریباً ${guests} مہمان۔`),
    }));
    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setError(''); setErrors({});
    try {
      await api('/api/events', { method: 'POST', json: { ...form, event_type: EVENT_TYPES.find((et) => et.id === inquiryType)?.en } });
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
        eyebrow={<><Sparkles className="w-4 h-4" /> {t('Events & Bulk Orders', 'تقریبات اور بلک آرڈرز')}</>}
        title={isUrdu
          ? <>ہر <span className="ow-gradient-text">مہمان، دفتر اور اجتماع</span> کے لیے پانی</>
          : <>Water for every <span className="ow-gradient-text">guest, desk & gathering</span></>}
        subtitle={t("Weddings, offices, schools, religious gatherings — tell us the size of your event and we'll handle the water.", 'شادیاں، دفاتر، اسکول، مذہبی اجتماعات — ہمیں اپنی تقریب کا سائز بتائیں، پانی کا انتظام ہم کریں گے۔')}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 max-w-5xl">
          <div className="space-y-6">
            <Reveal className="ow-card p-6 space-y-5">
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2"><Calculator className="w-5 h-5 ow-cyan" /> {t('Quick estimate', 'فوری اندازہ')}</h2>
              <div>
                <label className="ow-label" htmlFor="ev-guests"><Users className="w-4 h-4 inline me-1" /> {t('Number of guests', 'مہمانوں کی تعداد')}</label>
                <input id="ev-guests" type="number" min={1} max={20000} className="ow-input" value={guests} onChange={(e) => setGuests(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="ow-label" htmlFor="ev-type">{t('Event type', 'تقریب کی قسم')}</label>
                  <select id="ev-type" className="ow-input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    {calcTypes.map((et) => <option key={et.id} value={et.id}>{et.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ow-label" htmlFor="ev-size">{t('Bottle size', 'بوتل کا سائز')}</label>
                  <select id="ev-size" className="ow-input" value={size?.id ?? ''} onChange={(e) => setSizeId(e.target.value)} disabled={!bottles.length}>
                    {bottles.map((b) => <option key={b.id} value={b.id}>{b.size} — {pkr(b.price)}</option>)}
                    {!bottles.length && <option value="">{t('Loading…', 'لوڈ ہو رہا ہے…')}</option>}
                  </select>
                </div>
              </div>
              <div className="rounded-xl p-5" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <p className="text-sm ow-muted">{isUrdu
                  ? <>تقریباً <strong className="text-white">{estimateBottles.toLocaleString()} بوتلیں</strong> (فی مہمان {perGuest})</>
                  : <>About <strong className="text-white">{estimateBottles.toLocaleString()} bottles</strong> ({perGuest} per guest)</>}</p>
                {size && <p className="font-heading font-black text-3xl text-white mt-1" dir="ltr">{pkr(estimateBottles * size.price)}</p>}
                <p className="text-xs ow-subtle mt-1">{t('At regular prices. Bulk orders get a discounted quote — ask us.', 'یہ عام قیمتوں پر ہے۔ بلک آرڈر پر رعایتی قیمت ملتی ہے — ہم سے پوچھیں۔')}</p>
              </div>
              <button className="ow-btn w-full" onClick={applyEstimate} disabled={!guests}>{t('Use this estimate in my inquiry', 'یہ اندازہ میری درخواست میں شامل کریں')}</button>
            </Reveal>

            <CardGrid cols={2}>
              {[
                { key: 'events', icon: PartyPopper, title: t('Weddings & events', 'شادیاں اور تقریبات'), text: t('Bottles delivered to your venue before your guests arrive.', 'مہمانوں کے آنے سے پہلے بوتلیں آپ کے مقام پر پہنچ جائیں گی۔') },
                { key: 'offices', icon: Building2, title: t('Offices & schools', 'دفاتر اور اسکول'), text: t('Regular 19L or bottle supply on a schedule that suits you.', 'آپ کی سہولت کے شیڈول پر 19 لیٹر یا بوتلوں کی باقاعدہ سپلائی۔') },
              ].map(({ key, icon, title, text }) => <FeatureCard key={key} icon={icon} title={title}>{text}</FeatureCard>)}
            </CardGrid>

            <Reveal delay={150} className="ow-card p-6">
              <h3 className="font-heading font-bold text-white mb-2 flex items-center gap-2"><Tag className="w-5 h-5 ow-cyan" /> {t('Custom labels', 'اپنے لیبل')}</h3>
              <p className="text-sm ow-muted mb-4">{t('Want your event name or company logo on the bottles? Ask us about custom labels and minimum quantities.', 'بوتلوں پر اپنی تقریب کا نام یا کمپنی کا لوگو چاہیے؟ کسٹم لیبل اور کم از کم تعداد کے بارے میں ہم سے پوچھیں۔')}</p>
              <a className="ow-btn-whatsapp !py-2.5 text-sm" target="_blank" rel="noopener noreferrer"
                href={whatsappLink(settings.contact_info.whatsapp, t('Hi One Water, I would like to ask about custom labels on bottles for my event.', 'السلام علیکم ون واٹر، مجھے اپنی تقریب کے لیے بوتلوں پر کسٹم لیبل کے بارے میں پوچھنا ہے۔'))}>
                <WhatsAppIcon className="w-4 h-4" /> {t('Ask about custom labels', 'کسٹم لیبل کے بارے میں پوچھیں')}
              </a>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div id="inquiry" className="scroll-mt-24">
              {status === 'sent' ? (
                <div className="ow-card p-8 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <h2 className="font-heading font-bold text-2xl text-white">{t('Inquiry received!', 'آپ کی درخواست موصول ہو گئی!')}</h2>
                  <p className="ow-muted">{t(`We'll contact you on your phone / WhatsApp with a quote during business hours (${settings.contact_info.hours}).`, `ہم اوقاتِ کار (${settings.contact_info.hours}) میں آپ کے فون / واٹس ایپ پر قیمت کے ساتھ رابطہ کریں گے۔`)}</p>
                  <button className="ow-btn-ghost" onClick={() => setStatus('idle')}>{t('Send another inquiry', 'ایک اور درخواست بھیجیں')}</button>
                </div>
              ) : (
                <form onSubmit={submit} className="ow-card p-6 space-y-4" noValidate>
                  <h2 className="font-heading font-bold text-xl text-white">{t('Get a bulk quote', 'بلک قیمت معلوم کریں')}</h2>
                  <div>
                    <label className="ow-label" htmlFor="ev-inquiry-type">{t('What do you need?', 'آپ کو کیا چاہیے؟')}</label>
                    <select id="ev-inquiry-type" className="ow-input" value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
                      {EVENT_TYPES.map((et) => <option key={et.id} value={et.id}>{et.label}</option>)}
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ev-name">{t('Your name *', 'آپ کا نام *')}</label><input {...field('name')} autoComplete="name" />{errors.name && <p className="ow-error">{errors.name}</p>}</div>
                    <div><label className="ow-label" htmlFor="ev-phone">{t('Phone / WhatsApp *', 'فون / واٹس ایپ *')}</label><input {...field('phone')} dir="ltr" type="tel" inputMode="tel" placeholder="0300 1234567" />{errors.phone && <p className="ow-error">{errors.phone}</p>}</div>
                  </div>
                  <div><label className="ow-label" htmlFor="ev-email">{t('Email (optional)', 'ای میل (اختیاری)')}</label><input {...field('email')} dir="ltr" type="email" autoComplete="email" />{errors.email && <p className="ow-error">{errors.email}</p>}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ev-event_date">{t('Event date', 'تقریب کی تاریخ')}</label><input {...field('event_date')} type="date" style={{ colorScheme: 'dark' }} /></div>
                    <div><label className="ow-label" htmlFor="ev-event_location">{t('Venue / area', 'مقام / علاقہ')}</label><input {...field('event_location')} placeholder={t('e.g. Marquee on GT Road', 'مثلاً جی ٹی روڈ والا مارکی')} /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="ow-label" htmlFor="ev-bottle_size">{t('Bottle size', 'بوتل کا سائز')}</label>
                      <select {...field('bottle_size')}>
                        <option value="">{t('Not sure yet', 'ابھی طے نہیں')}</option>
                        {products.filter((p) => p.inStock).map((p) => <option key={p.id} value={p.size}>{p.size}</option>)}
                      </select>
                    </div>
                    <div><label className="ow-label" htmlFor="ev-quantity">{t('Quantity', 'تعداد')}</label><input {...field('quantity')} inputMode="numeric" placeholder={t('e.g. 300', 'مثلاً 300')} /></div>
                  </div>
                  <div><label className="ow-label" htmlFor="ev-notes">{t('Anything else?', 'کچھ اور؟')}</label><textarea {...field('notes')} rows={3} placeholder={t('Delivery time, custom labels, etc.', 'ڈیلیوری کا وقت، کسٹم لیبل وغیرہ')} /></div>
                  {error && !Object.keys(errors).length && <p className="ow-error">{error}</p>}
                  <button className="ow-btn w-full" disabled={status === 'sending'}><Send className="w-4 h-4" /> {status === 'sending' ? t('Sending…', 'بھیجا جا رہا ہے…') : t('Request my quote', 'مجھے قیمت بتائیں')}</button>
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
              <span className="ow-eyebrow"><Building2 className="w-4 h-4" /> {t('Offices, shops & schools', 'دفاتر، دکانیں اور اسکول')}</span>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white mt-4 mb-3">{t('Regular water for your workplace', 'آپ کے کام کی جگہ کے لیے باقاعدہ پانی')}</h2>
              <p className="ow-muted mb-5">{t("Set it once and stop worrying about running out. Tell us how many people you have and we'll suggest a plan.", 'ایک بار طے کریں اور پانی ختم ہونے کی فکر چھوڑ دیں۔ ہمیں بتائیں آپ کے ہاں کتنے لوگ ہیں، ہم آپ کو پلان بتا دیں گے۔')}</p>
              <ul className="space-y-2 text-sm">
                {[
                  t('A fixed delivery day each week', 'ہر ہفتے ڈیلیوری کا ایک مقررہ دن'),
                  t('Swap your empties — pay only for the water', 'اپنی خالی بوتلیں واپس کریں — صرف پانی کی قیمت دیں'),
                  t('One WhatsApp contact for orders and changes', 'آرڈر اور تبدیلیوں کے لیے ایک ہی واٹس ایپ رابطہ'),
                  t('Ask us about monthly billing and dispensers', 'ماہانہ بلنگ اور ڈسپنسر کے بارے میں ہم سے پوچھیں'),
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-white/90"><span className="ow-cyan">✓</span> {item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button className="ow-btn" onClick={() => { setInquiryType('office'); document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t('Request an office plan', 'دفتر کا پلان منگوائیں')}</button>
              <a className="ow-btn-whatsapp" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, t('Assalam o Alaikum! I would like regular water delivery for my office/shop.', 'السلام علیکم! مجھے اپنے دفتر / دکان کے لیے پانی کی باقاعدہ ڈیلیوری چاہیے۔'))}><WhatsAppIcon /> {t('Discuss on WhatsApp', 'واٹس ایپ پر بات کریں')}</a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
