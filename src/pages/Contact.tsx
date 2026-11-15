import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send, MessageSquare, Navigation } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { useSiteSettings, whatsappLink, telLink } from '@/hooks/useSiteSettings';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import WaitlistForm from '@/components/site/WaitlistForm';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import { CardGrid, FeatureCard } from '@/components/site/Cards';
import { useLang } from '@/contexts/LanguageContext';

const EMPTY = { name: '', phone: '', email: '', message: '' };

export default function Contact() {
  const { settings } = useSiteSettings();
  const { t, isUrdu } = useLang();
  const c = settings.contact_info;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setError(''); setErrors({});
    try {
      await api('/api/contact', { method: 'POST', json: form });
      setStatus('sent');
      trackEvent('generate_lead', { form: 'contact' });
      setForm(EMPTY);
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError) { setErrors(err.fieldErrors); setError(err.message); }
    }
  };

  const field = (k: keyof typeof EMPTY) => ({
    id: `ct-${k}`, className: 'ow-input', value: form[k], 'aria-invalid': !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  const mapQuery = encodeURIComponent(`One Water, ${c.address}`);
  const cards = [
    { key: 'whatsapp', icon: WhatsAppIcon, label: t('WhatsApp', 'واٹس ایپ'), value: <span dir="ltr">{c.phone}</span>, sub: t('Fastest way to order', 'آرڈر کا سب سے تیز طریقہ'), href: whatsappLink(c.whatsapp, t('Assalam o Alaikum One Water!', 'السلام علیکم ون واٹر!')), tint: 'whatsapp' as const, external: true },
    { key: 'call', icon: Phone, label: t('Call us', 'کال کریں'), value: <span dir="ltr">{c.phone}</span>, sub: c.hours, href: telLink(c.phone), tint: 'cyan' as const, external: false },
    { key: 'email', icon: Mail, label: t('Email', 'ای میل'), value: <span dir="ltr">{c.email}</span>, sub: t('For business inquiries', 'کاروباری معلومات کے لیے'), href: `mailto:${c.email}`, tint: 'blue' as const, external: false },
    { key: 'plant', icon: MapPin, label: t('Our plant', 'ہمارا پلانٹ'), value: c.address, sub: t('Get directions', 'راستہ دیکھیں'), href: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`, tint: 'green' as const, external: true },
  ];

  return (
    <div className="ow-page">
      <Seo
        path="/contact"
      />
      <PageHero
        eyebrow={<><MessageSquare className="w-4 h-4" /> {t('Contact us', 'رابطہ کریں')}</>}
        title={isUrdu
          ? <>ہم بس ایک <span className="ow-gradient-text">میسج کی دوری</span> پر ہیں</>
          : <>We're a <span className="ow-gradient-text">message away</span></>}
        subtitle={t(`Order, ask about the deposit, or request a bulk quote. We reply during business hours: ${c.hours}.`, `آرڈر کریں، سیکیورٹی کے بارے میں پوچھیں یا بلک قیمت معلوم کریں۔ ہم اوقاتِ کار میں جواب دیتے ہیں: ${c.hours}۔`)}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <CardGrid cols={4} className="mb-12">
            {cards.map(({ key, icon, label, value, sub, href, tint, external }) => (
              <FeatureCard key={key} icon={icon} tint={tint} eyebrow={label} title={value} href={href} external={external}>{sub}</FeatureCard>
            ))}
          </CardGrid>

          <div className="grid lg:grid-cols-2 gap-8">
            <Reveal>
              {status === 'sent' ? (
                <div className="ow-card p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                  <h2 className="font-heading font-bold text-2xl text-white">{t('Message sent!', 'میسج بھیج دیا گیا!')}</h2>
                  <p className="ow-muted">{t(`We'll get back to you during business hours (${c.hours}). Need it sooner? WhatsApp us.`, `ہم اوقاتِ کار (${c.hours}) میں آپ سے رابطہ کریں گے۔ جلدی ہے؟ ہمیں واٹس ایپ کریں۔`)}</p>
                  <button className="ow-btn-ghost" onClick={() => setStatus('idle')}>{t('Send another message', 'ایک اور میسج بھیجیں')}</button>
                </div>
              ) : (
                <form onSubmit={submit} className="ow-card p-6 space-y-4" noValidate>
                  <h2 className="font-heading font-bold text-xl text-white">{t('Send us a message', 'ہمیں میسج بھیجیں')}</h2>
                  <div><label className="ow-label" htmlFor="ct-name">{t('Your name', 'آپ کا نام')}</label><input {...field('name')} autoComplete="name" />{errors.name && <p className="ow-error">{errors.name}</p>}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ct-phone">{t('Phone / WhatsApp', 'فون / واٹس ایپ')}</label><input {...field('phone')} dir="ltr" type="tel" inputMode="tel" placeholder="0300 1234567" autoComplete="tel" />{errors.phone && <p className="ow-error">{errors.phone}</p>}</div>
                    <div><label className="ow-label" htmlFor="ct-email">{t('Email (optional)', 'ای میل (اختیاری)')}</label><input {...field('email')} dir="ltr" type="email" autoComplete="email" />{errors.email && <p className="ow-error">{errors.email}</p>}</div>
                  </div>
                  <div><label className="ow-label" htmlFor="ct-message">{t('Message', 'میسج')}</label><textarea {...field('message')} rows={5} placeholder={t('How can we help?', 'ہم آپ کی کیا مدد کر سکتے ہیں؟')} />{errors.message && <p className="ow-error">{errors.message}</p>}</div>
                  {error && !Object.keys(errors).length && <p className="ow-error">{error}</p>}
                  <button className="ow-btn w-full" disabled={status === 'sending'}><Send className="w-4 h-4" /> {status === 'sending' ? t('Sending…', 'بھیجا جا رہا ہے…') : t('Send message', 'میسج بھیجیں')}</button>
                  <p className="text-xs text-center ow-subtle">{t('Give us a phone number or an email so we can reply.', 'فون نمبر یا ای میل ضرور دیں تاکہ ہم جواب دے سکیں۔')}</p>
                </form>
              )}
            </Reveal>

            <Reveal delay={100} className="ow-card overflow-hidden min-h-[360px] flex flex-col">
              <iframe
                title={t('One Water plant location, Gujranwala', 'ون واٹر پلانٹ کا مقام، گوجرانوالہ')}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full flex-1 min-h-[300px] border-0"
                loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4 flex items-center justify-between gap-3">
                <p className="text-sm ow-muted flex items-center gap-2"><Clock className="w-4 h-4 ow-cyan shrink-0" /> {c.hours}</p>
                <a className="text-sm ow-cyan font-medium flex items-center gap-1 hover:underline shrink-0" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}><Navigation className="w-4 h-4" /> {t('Directions', 'راستہ')}</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading
            eyebrow={<><MapPin className="w-4 h-4" /> {t('Not in Gujranwala?', 'گوجرانوالہ میں نہیں رہتے؟')}</>}
            title={t('Bring One Water to your city', 'ون واٹر کو اپنے شہر میں لائیں')}
            subtitle={t("We're expanding across Pakistan. Tell us where you are — the cities with the most requests get One Water first.", 'ہم پورے پاکستان میں پھیل رہے ہیں۔ ہمیں بتائیں آپ کہاں ہیں — جن شہروں سے سب سے زیادہ درخواستیں آئیں گی، ون واٹر وہاں پہلے پہنچے گا۔')}
          />
          <Reveal className="ow-card p-6"><WaitlistForm /></Reveal>
        </div>
      </section>
    </div>
  );
}
