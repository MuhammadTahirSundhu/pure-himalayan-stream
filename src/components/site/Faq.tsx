import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import { useLang, type Lang } from '@/contexts/LanguageContext';
import JsonLd from './JsonLd';

interface QA { q: string; a: string; link?: { to: string; label: string } }

/** FAQ list in the given language. The FAQPage JSON-LD always uses the English list. */
export function useFaqs(lang: Lang = 'en'): QA[] {
  const { settings } = useSiteSettings();
  const deposit = settings.delivery_info.bottle_deposit;
  const cities = settings.service_areas.cities.join(', ');
  const walletText = settings.payment_accounts.map((a) => a.label).join(' / ');
  return useMemo(() => {
    const t = (en: string, ur: string) => (lang === 'ur' ? ur : en);
    const payText = walletText
      ? t(`Cash on delivery, or ${walletText} transfer — upload the payment screenshot at checkout.`,
          `کیش آن ڈیلیوری، یا ${walletText} کے ذریعے ٹرانسفر — چیک آؤٹ پر پیمنٹ کا اسکرین شاٹ اپلوڈ کریں۔`)
      : t('Cash on delivery. Pay the rider when your water arrives.', 'کیش آن ڈیلیوری۔ پانی پہنچنے پر رائیڈر کو ادائیگی کریں۔');
    return [
      { q: t('Where do you deliver?', 'آپ کہاں ڈیلیوری کرتے ہیں؟'),
        a: t(`We currently deliver across all of ${cities}. We're expanding to more cities in Pakistan — tell us your city and we'll let you know when we arrive.`,
             `فی الحال ہم پورے ${cities} میں ڈیلیوری کرتے ہیں۔ ہم پاکستان کے مزید شہروں تک آ رہے ہیں — ہمیں اپنا شہر بتائیں، جب ہم وہاں پہنچیں گے تو آپ کو اطلاع دیں گے۔`),
        link: { to: '/contact#waitlist', label: t('Join the city waitlist', 'شہر کی ویٹ لسٹ میں شامل ہوں') } },
      { q: t('How does the 19L bottle deposit work?', '19 لیٹر بوتل کی سیکیورٹی کیسے کام کرتی ہے؟'),
        a: t(`A new 19L bottle has a one-time refundable deposit of ${pkr(deposit)}. If you hand back an empty One Water bottle, you only pay for the water — no deposit. Return the bottle any time to get your deposit back.`,
             `نئی 19 لیٹر بوتل پر ایک بار ${pkr(deposit)} قابلِ واپسی سیکیورٹی لگتی ہے۔ اگر آپ ون واٹر کی خالی بوتل واپس کریں تو صرف پانی کی قیمت دیں — کوئی سیکیورٹی نہیں۔ کسی بھی وقت بوتل واپس کر کے اپنی سیکیورٹی واپس لیں۔`) },
      { q: t('How do I pay?', 'ادائیگی کیسے کروں؟'), a: payText },
      { q: t('Is One Water Himalayan or spring water?', 'کیا ون واٹر ہمالیہ یا چشمے کا پانی ہے؟'),
        a: t('No — and we think honesty matters. One Water is produced at our own plant in Gujranwala. Every litre goes through a 10-stage process including reverse osmosis, UV and ozone treatment, with essential minerals added back for taste and balance.',
             'نہیں — اور ہمارے نزدیک ایمانداری ضروری ہے۔ ون واٹر گوجرانوالہ میں ہمارے اپنے پلانٹ میں تیار ہوتا ہے۔ ہر لیٹر 10 مراحل سے گزرتا ہے جن میں آر او (RO)، یو وی اور اوزون ٹریٹمنٹ شامل ہیں، اور ذائقے اور توازن کے لیے ضروری منرلز دوبارہ شامل کیے جاتے ہیں۔'),
        link: { to: '/quality', label: t('See the 10-stage process', '10 مراحل کا عمل دیکھیں') } },
      { q: t('Is the water lab-tested?', 'کیا پانی لیب سے ٹیسٹ شدہ ہے؟'),
        a: t('Yes. Our water is tested by PCRWR (Pakistan Council of Research in Water Resources). You can view the lab report and our certificates on the Quality page.',
             'جی ہاں۔ ہمارا پانی PCRWR (پاکستان کونسل آف ریسرچ اِن واٹر ریسورسز) سے ٹیسٹ ہوتا ہے۔ لیب رپورٹ اور ہمارے سرٹیفکیٹس کوالٹی والے صفحے پر دیکھ سکتے ہیں۔'),
        link: { to: '/quality#certifications', label: t('View certificates', 'سرٹیفکیٹس دیکھیں') } },
      { q: t('Can I get a regular weekly delivery?', 'کیا ہر ہفتے باقاعدہ ڈیلیوری مل سکتی ہے؟'),
        a: t('Yes. Choose weekly, every 2 weeks or monthly when you order 19L bottles and we’ll confirm your delivery day on WhatsApp. There are no automatic charges — you pay per delivery.',
             'جی ہاں۔ 19 لیٹر بوتلیں آرڈر کرتے وقت ہر ہفتے، ہر دو ہفتے یا ہر مہینے چنیں، ہم واٹس ایپ پر آپ کی ڈیلیوری کا دن کنفرم کر دیں گے۔ کوئی خودکار چارجز نہیں — ہر ڈیلیوری پر ادائیگی کریں۔') },
      { q: t('Do you supply offices, shops and events?', 'کیا آپ دفاتر، دکانوں اور ایونٹس کو پانی دیتے ہیں؟'),
        a: t('Yes — offices, schools, shops, weddings and events. Send us your quantity and date and we’ll share a bulk quote.',
             'جی ہاں — دفاتر، اسکول، دکانیں، شادیاں اور ایونٹس۔ ہمیں تعداد اور تاریخ بھیجیں، ہم آپ کو بلک ریٹ بتا دیں گے۔'),
        link: { to: '/events', label: t('Get a bulk quote', 'بلک ریٹ معلوم کریں') } },
    ];
  }, [lang, deposit, cities, walletText]);
}

export default function Faq({ withSchema = true }: { withSchema?: boolean }) {
  const { lang } = useLang();
  const faqsEn = useFaqs('en');
  const faqs = useFaqs(lang);
  const [open, setOpen] = useState<number | null>(0);
  // Structured data stays in English for search engines.
  const schema = useMemo(() => [{
    '@type': 'FAQPage',
    mainEntity: faqsEn.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }], [faqsEn]);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {withSchema && <JsonLd data={schema} />}
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="ow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-4 p-5 text-start"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <h3 className="font-semibold text-white">{f.q}</h3>
              <ChevronDown className={`w-5 h-5 shrink-0 ow-cyan transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 ow-muted leading-relaxed">
                  {f.a}{' '}
                  {f.link && <Link to={f.link.to} className="ow-cyan font-medium hover:underline whitespace-nowrap">{f.link.label} <span className="inline-block rtl:rotate-180">→</span></Link>}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

