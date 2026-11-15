import { Link } from 'react-router-dom';
import { Factory, ShieldCheck, Eye, HeartHandshake, MapPin, Rocket, FlaskConical, Award } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import WaitlistForm from '@/components/site/WaitlistForm';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import Gallery from '@/components/site/Gallery';
import { CardGrid, FeatureCard } from '@/components/site/Cards';
import { useLang } from '@/contexts/LanguageContext';
import bottleFamily from '@/assets/media/7.webp';
import bottleStudio from '@/assets/media/13.webp';
import bottle19 from '@/assets/media/15.webp';

export default function About() {
  const { settings } = useSiteSettings();
  const city = settings.service_areas.cities[0] ?? 'Gujranwala';
  const { t, isUrdu } = useLang();
  const cityUr = city === 'Gujranwala' ? 'گوجرانوالہ' : city;

  const VALUES = [
    { key: 'safety', icon: ShieldCheck, title: t('Safety first', 'سب سے پہلے حفاظت'), text: t('Produced under a Punjab Food Authority licence and an ISO 9001 quality system.', 'پنجاب فوڈ اتھارٹی کے لائسنس اور ISO 9001 کوالٹی سسٹم کے تحت تیار کیا جاتا ہے۔') },
    { key: 'honesty', icon: Eye, title: t('Radical honesty', 'مکمل ایمانداری'), text: t('We tell you exactly where our water comes from and publish our lab results.', 'ہم آپ کو صاف بتاتے ہیں کہ ہمارا پانی کہاں سے آتا ہے اور اپنے لیب کے نتائج شائع کرتے ہیں۔') },
    { key: 'proven', icon: FlaskConical, title: t('Proven, not promised', 'صرف وعدہ نہیں، ثبوت'), text: t('Independent PCRWR testing: “fit for drinking” on every parameter.', 'آزاد PCRWR ٹیسٹنگ: ہر پیمانے پر ”پینے کے قابل“۔') },
    { key: 'local', icon: HeartHandshake, title: t('Local service', 'مقامی سروس'), text: t('A Gujranwala team you can call or WhatsApp — and a rider who knows your street.', 'گوجرانوالہ کی ٹیم جسے آپ کال یا واٹس ایپ کر سکتے ہیں — اور ایسا رائیڈر جو آپ کی گلی جانتا ہے۔') },
  ];

  const ROADMAP = [
    { key: 'plant', icon: Factory, title: t('Our plant in Gujranwala', 'گوجرانوالہ میں ہمارا پلانٹ'), text: t('Every bottle is purified, mineral-balanced and sealed at our own facility.', 'ہر بوتل ہمارے اپنے پلانٹ پر صاف کی جاتی ہے، منرلز متوازن کیے جاتے ہیں اور سیل کی جاتی ہے۔'), done: true },
    { key: 'delivery', icon: MapPin, title: t('Delivering across Gujranwala', 'پورے گوجرانوالہ میں ڈیلیوری'), text: t('Homes, offices, shops and events across the whole city.', 'پورے شہر میں گھر، دفاتر، دکانیں اور تقریبات۔'), done: true },
    { key: 'next', icon: Rocket, title: t('Next: more cities in Pakistan', 'اگلا قدم: پاکستان کے مزید شہر'), text: t('We are preparing to expand. Tell us your city and help decide where we go next.', 'ہم پھیلنے کی تیاری کر رہے ہیں۔ ہمیں اپنا شہر بتائیں اور فیصلہ کرنے میں مدد کریں کہ ہم اگلا کہاں جائیں۔'), done: false },
  ];

  return (
    <div className="ow-page">
      <Seo
        path="/about"
        jsonLd={[{ '@type': 'AboutPage', name: 'About One Water', url: 'https://www.onewaterpakistan.com/about' }]}
      />
      <PageHero
        eyebrow={<><Award className="w-4 h-4" /> {t('Our story', 'ہماری کہانی')}</>}
        title={isUrdu ? <>{cityUr} میں تیار۔ <span className="ow-gradient-text">بھروسے پر قائم۔</span></> : <>Made in {city}. <span className="ow-gradient-text">Built on trust.</span></>}
        subtitle={t('One Water — “Quality is our Identity”. Clean, safe drinking water from our own plant, delivered by people who live in your city.', 'ون واٹر — ”کوالٹی ہماری پہچان ہے“۔ ہمارے اپنے پلانٹ سے صاف، محفوظ پینے کا پانی، جو آپ کے اپنے شہر کے لوگ پہنچاتے ہیں۔')}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
          <Reveal direction="left" className="space-y-5">
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white">{t('Why we started One Water', 'ہم نے ون واٹر کیوں شروع کیا')}</h2>
            <p className="ow-muted leading-relaxed">
              {t(
                `Families in ${city} deserve drinking water they don't have to worry about. So we built our own purification plant at Green Valley Phase 1 and set one rule: every bottle must be something we would give our own children.`,
                `${cityUr} کے گھرانوں کا حق ہے کہ انہیں پینے کے پانی کی فکر نہ کرنی پڑے۔ اسی لیے ہم نے گرین ویلی فیز 1 میں اپنا صفائی پلانٹ لگایا اور ایک اصول بنایا: ہر بوتل ایسی ہو جو ہم اپنے بچوں کو دے سکیں۔`,
              )}
            </p>
            <p className="ow-muted leading-relaxed">
              {t(
                "Our water goes through a 10-stage process — filtration, activated carbon, reverse osmosis, mineral balancing, UV, ozone and micron filtration — before it is sealed. We don't claim mountain springs or glaciers. We'd rather show you the lab report.",
                'سیل ہونے سے پہلے ہمارا پانی 10 مراحل سے گزرتا ہے — فلٹریشن، ایکٹیویٹڈ کاربن، آر او (RO)، منرلز کا توازن، UV، اوزون اور مائیکرون فلٹریشن۔ ہم پہاڑی چشموں یا گلیشیئرز کا دعویٰ نہیں کرتے۔ اس کے بجائے ہم آپ کو لیب رپورٹ دکھاتے ہیں۔',
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/quality" className="ow-btn">{t('See our lab results', 'ہمارے لیب کے نتائج دیکھیں')}</Link>
              <Link to="/contact" className="ow-btn-ghost">{t('Visit or call us', 'ہم سے ملیں یا کال کریں')}</Link>
            </div>
          </Reveal>
          <Reveal direction="right" className="grid grid-cols-2 gap-4">
            <img src={bottleStudio} alt={t('One Water bottle', 'ون واٹر بوتل')} loading="lazy" className="rounded-2xl object-cover w-full h-64 md:h-80 ow-card" />
            <div className="grid gap-4">
              <img src={bottleFamily} alt={t('One Water bottles in two sizes', 'دو سائز میں ون واٹر بوتلیں')} loading="lazy" className="rounded-2xl object-cover w-full h-[7.5rem] md:h-[9.5rem] ow-card" />
              <img src={bottle19} alt={t('One Water 19 litre bottle', 'ون واٹر 19 لیٹر بوتل')} loading="lazy" className="rounded-2xl object-cover w-full h-[7.5rem] md:h-[9.5rem] ow-card" />
            </div>
          </Reveal>
        </div>
      </section>

      <Gallery title={t('Inside One Water', 'ون واٹر کے اندر')} />

      <section className="py-16" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={t('What we stand for', 'ہمارے اصول')} title={isUrdu ? <>ہمارے <span className="ow-gradient-text">وعدے</span></> : <>Our <span className="ow-gradient-text">promises</span></>} />
          <CardGrid cols={4} className="max-w-6xl mx-auto">
            {VALUES.map(({ key, icon, title, text }) => <FeatureCard key={key} icon={icon} title={title}>{text}</FeatureCard>)}
          </CardGrid>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow={t("Where we're going", 'ہماری منزل')} title={isUrdu ? <>آج {cityUr}، <span className="ow-gradient-text">آگے پاکستان</span></> : <>{city} today, <span className="ow-gradient-text">Pakistan next</span></>} />
          <ol className="relative space-y-6 before:absolute before:start-6 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-cyan-400/60 before:to-cyan-400/0">
            {ROADMAP.map(({ key, icon: Icon, title, text, done }, i) => (
              <li key={key}>
                <Reveal delay={i * 120} className="relative flex gap-5">
                  <span className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? 'linear-gradient(135deg,#00d4ff,#0284c7)' : 'rgba(255,255,255,0.05)', border: done ? 'none' : '1px dashed rgba(0,212,255,0.5)' }}>
                    <Icon className={`w-5 h-5 ${done ? 'text-white' : 'ow-cyan'}`} />
                  </span>
                  <div className="ow-card p-5 flex-1">
                    <p className="text-xs uppercase tracking-wider rtl:tracking-normal mb-1" style={{ color: done ? '#34d399' : '#fbbf24' }}>{done ? t('Today', 'آج') : t('Coming soon', 'جلد آ رہا ہے')}</p>
                    <h3 className="font-heading font-bold text-white">{title}</h3>
                    <p className="text-sm ow-muted">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="ow-card p-6 mt-10">
            <p className="font-semibold text-white mb-3">{t('Want One Water in your city? Join the waitlist.', 'اپنے شہر میں ون واٹر چاہتے ہیں؟ ویٹ لسٹ میں شامل ہوں۔')}</p>
            <WaitlistForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
