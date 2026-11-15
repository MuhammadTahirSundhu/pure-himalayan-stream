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

const EMPTY = { name: '', phone: '', email: '', message: '' };

export default function Contact() {
  const { settings } = useSiteSettings();
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
    { icon: WhatsAppIcon, label: 'WhatsApp', value: c.phone, sub: 'Fastest way to order', href: whatsappLink(c.whatsapp, 'Assalam o Alaikum One Water!'), tint: 'whatsapp' as const, external: true },
    { icon: Phone, label: 'Call us', value: c.phone, sub: c.hours, href: telLink(c.phone), tint: 'cyan' as const, external: false },
    { icon: Mail, label: 'Email', value: c.email, sub: 'For business inquiries', href: `mailto:${c.email}`, tint: 'blue' as const, external: false },
    { icon: MapPin, label: 'Our plant', value: c.address, sub: 'Get directions', href: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`, tint: 'green' as const, external: true },
  ];

  return (
    <div className="ow-page">
      <Seo
        path="/contact"
      />
      <PageHero
        eyebrow={<><MessageSquare className="w-4 h-4" /> Contact us</>}
        title={<>We're a <span className="ow-gradient-text">message away</span></>}
        subtitle={`Order, ask about the deposit, or request a bulk quote. We reply during business hours: ${c.hours}.`}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <CardGrid cols={4} className="mb-12">
            {cards.map(({ icon, label, value, sub, href, tint, external }) => (
              <FeatureCard key={label} icon={icon} tint={tint} eyebrow={label} title={value} href={href} external={external}>{sub}</FeatureCard>
            ))}
          </CardGrid>

          <div className="grid lg:grid-cols-2 gap-8">
            <Reveal>
              {status === 'sent' ? (
                <div className="ow-card p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                  <h2 className="font-heading font-bold text-2xl text-white">Message sent!</h2>
                  <p className="ow-muted">We'll get back to you during business hours ({c.hours}). Need it sooner? WhatsApp us.</p>
                  <button className="ow-btn-ghost" onClick={() => setStatus('idle')}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={submit} className="ow-card p-6 space-y-4" noValidate>
                  <h2 className="font-heading font-bold text-xl text-white">Send us a message</h2>
                  <div><label className="ow-label" htmlFor="ct-name">Your name</label><input {...field('name')} autoComplete="name" />{errors.name && <p className="ow-error">{errors.name}</p>}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="ow-label" htmlFor="ct-phone">Phone / WhatsApp</label><input {...field('phone')} type="tel" inputMode="tel" placeholder="0300 1234567" autoComplete="tel" />{errors.phone && <p className="ow-error">{errors.phone}</p>}</div>
                    <div><label className="ow-label" htmlFor="ct-email">Email (optional)</label><input {...field('email')} type="email" autoComplete="email" />{errors.email && <p className="ow-error">{errors.email}</p>}</div>
                  </div>
                  <div><label className="ow-label" htmlFor="ct-message">Message</label><textarea {...field('message')} rows={5} placeholder="How can we help?" />{errors.message && <p className="ow-error">{errors.message}</p>}</div>
                  {error && !Object.keys(errors).length && <p className="ow-error">{error}</p>}
                  <button className="ow-btn w-full" disabled={status === 'sending'}><Send className="w-4 h-4" /> {status === 'sending' ? 'Sending…' : 'Send message'}</button>
                  <p className="text-xs text-center ow-subtle">Give us a phone number or an email so we can reply.</p>
                </form>
              )}
            </Reveal>

            <Reveal delay={100} className="ow-card overflow-hidden min-h-[360px] flex flex-col">
              <iframe
                title="One Water plant location, Gujranwala"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full flex-1 min-h-[300px] border-0"
                loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4 flex items-center justify-between gap-3">
                <p className="text-sm ow-muted flex items-center gap-2"><Clock className="w-4 h-4 ow-cyan shrink-0" /> {c.hours}</p>
                <a className="text-sm ow-cyan font-medium flex items-center gap-1 hover:underline shrink-0" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}><Navigation className="w-4 h-4" /> Directions</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading
            eyebrow={<><MapPin className="w-4 h-4" /> Not in Gujranwala?</>}
            title="Bring One Water to your city"
            subtitle="We're expanding across Pakistan. Tell us where you are — the cities with the most requests get One Water first."
          />
          <Reveal className="ow-card p-6"><WaitlistForm /></Reveal>
        </div>
      </section>
    </div>
  );
}
