import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, MessageCircle, ArrowRight, Clock } from 'lucide-react';
import { hoursTextUr } from '@/lib/hours';
import { useSiteSettings, whatsappLink, telLink } from '@/hooks/useSiteSettings';
import { useLang } from '@/contexts/LanguageContext';

const CYAN = '#00d4ff';

export default function Footer() {
  const { settings } = useSiteSettings();
  const c = settings.contact_info;
  const { t, isUrdu } = useLang();
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #030D1A 0%, #000d1a 100%)',
        borderTop: '1px solid rgba(0,212,255,0.12)',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />

      {/* Background hex grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="footer-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 58,15 58,37 30,51 2,37 2,15" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-hex)" />
      </svg>

      <div className="container mx-auto px-4 py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
              >
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white" dir="ltr">
                One<span style={{ color: CYAN }}>Water</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(150,200,255,0.65)' }}>
              {t(
                '10-stage purified, PCRWR lab-tested mineral water from our own plant in Gujranwala — delivered to homes, offices and events across the city.',
                'گوجرانوالہ میں ہمارے اپنے پلانٹ سے 10 مراحل میں صاف کیا گیا، PCRWR لیب سے ٹیسٹ شدہ منرل واٹر — پورے شہر میں گھروں، دفتروں اور ایونٹس تک ڈیلیوری۔',
              )}
            </p>
            <a
              href={whatsappLink(c.whatsapp, t('Hi One Water!', 'السلام علیکم ون واٹر!'))}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: CYAN }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
            >
              <MessageCircle className="w-4 h-4" /> {t('WhatsApp Us', 'واٹس ایپ کریں')}
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">{t('Quick Links', 'اہم لنکس')}</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/products', label: t('Products', 'پروڈکٹس') },
                { to: '/quality',  label: t('Quality & Purity', 'کوالٹی اور صفائی') },
                { to: '/contact#waitlist', label: t('Bring us to your city', 'ہمیں اپنے شہر بلائیں') },
                { to: '/about',    label: t('About Us', 'ہمارے بارے میں') },
                { to: '/blog',     label: t('Water guides', 'پانی کے بارے میں معلومات') },
              ].map(link => (
                <Link
                  key={link.to} to={link.to}
                  className="flex items-center gap-1.5 text-sm transition-all duration-200 group"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">{t('Services', 'سروسز')}</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/delivery', label: t('19L Home Delivery', '19 لیٹر ہوم ڈیلیوری') },
                { to: '/events',   label: t('Bulk & Events', 'بلک آرڈر اور ایونٹس') },
                { to: '/offers',   label: t('Offers', 'آفرز') },
                { to: '/track',    label: t('Track your order', 'اپنا آرڈر ٹریک کریں') },
                { to: '/contact',  label: t('Contact Us', 'ہم سے رابطہ کریں') },
              ].map(link => (
                <Link
                  key={link.to} to={link.to}
                  className="flex items-center gap-1.5 text-sm transition-all duration-200 group"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">{t('Contact', 'رابطہ')}</h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: Phone,  href: telLink(c.phone),   text: c.phone, label: t('Phone', 'فون') },
                { icon: Mail,   href: `mailto:${c.email}`, text: c.email, label: t('Email', 'ای میل') },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  aria-label={`${item.label}: ${item.text}`}
                  className="flex items-center gap-2.5 text-sm transition-all duration-200"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <item.icon className="w-4 h-4 shrink-0" style={{ color: CYAN }} />
                  <span dir="ltr">{item.text}</span>
                </a>
              ))}
              <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(150,200,255,0.65)' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: CYAN }} />
                <span><span className="sr-only">{t('Address', 'پتہ')}: </span>{c.address}</span>
              </div>
              {c.hours && (
                <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(150,200,255,0.65)' }}>
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: CYAN }} />
                  <span><span className="sr-only">{t('Business hours', 'اوقاتِ کار')}: </span>{isUrdu ? hoursTextUr(settings.business_hours) : c.hours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
          style={{ borderTop: '1px solid rgba(0,212,255,0.10)', color: 'rgba(100,160,210,0.5)' }}
        >
          <p>© {new Date().getFullYear()} {t('One Water Pakistan. All rights reserved.', 'ون واٹر پاکستان۔ جملہ حقوق محفوظ ہیں۔')}</p>
          <div className="flex items-center gap-1" style={{ color: CYAN, opacity: 0.6 }}>
            <Droplets className="w-3 h-3" />
            <span className="text-xs">{t('Quality is our Identity', 'کوالٹی ہماری پہچان ہے')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
