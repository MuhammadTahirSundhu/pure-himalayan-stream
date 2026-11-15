import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronRight, FlaskConical, ShieldCheck, Droplets, Award, ArrowRight, Truck, Tag, MapPin, Factory, Wallet } from 'lucide-react';
import { useProducts, useDispenserProduct } from '@/hooks/useProducts';
import { useOffers } from '@/hooks/useOffers';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import ProductCard from '@/components/ProductCard';
import ClientsMarquee from '@/components/ClientsMarquee';
import Reveal from '@/components/Reveal';
import { revealImmediately } from '@/hooks/useScrollReveal';
import Bubbles from '@/components/site/Bubbles';
import WaveDivider from '@/components/site/WaveDivider';
import SectionHeading from '@/components/site/SectionHeading';
import TrustRow from '@/components/site/TrustRow';
import HowItWorks from '@/components/site/HowItWorks';
import OrderBuilder from '@/components/site/OrderBuilder';
import Faq from '@/components/site/Faq';
import WaitlistForm from '@/components/site/WaitlistForm';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';
import Seo from '@/components/site/Seo';
import { useLang } from '@/contexts/LanguageContext';
import OrderAgain from '@/components/site/OrderAgain';
import Testimonials from '@/components/site/Testimonials';
import { CardGrid, FeatureCard, StatCard } from '@/components/site/Cards';
import heroPoster from '@/assets/brand/hero-bg.webp';
import brandLogo from '@/assets/media/2.webp';

/** Counts up to a real number once visible. */
function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (revealImmediately()) { setVal(to); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1200);
        setVal(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref} className="tabular-nums">{val.toFixed(decimals)}{suffix}</span>;
}

/** Skip the 2.7 MB hero video for data-saver users, slow connections and reduced motion. */
function useShouldPlayVideo() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '');
    setOk(!slow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return ok;
}

export default function Home() {
  const { t, isUrdu } = useLang();
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { data: products, isLoading } = useProducts();
  const { product: dispenser } = useDispenserProduct();
  const { data: offers = [] } = useOffers();
  const { settings } = useSiteSettings();
  const playVideo = useShouldPlayVideo();
  const city = settings.service_areas.cities[0] ?? 'Gujranwala';
  const freeDelivery = !settings.delivery_info.charge_delivery;
  const cityUr = city === 'Gujranwala' ? 'گوجرانوالہ' : city;
  const wa = whatsappLink(settings.contact_info.whatsapp, t('Assalam o Alaikum One Water! I would like to order water.', 'السلام علیکم ون واٹر! میں پانی آرڈر کرنا چاہتا ہوں۔'));
  const offer = offers[0];
  const productCount = products?.length ?? 4;

  const STATS = [
    { key: 'stages', value: 10, label: t('Purification stages', 'صفائی کے مراحل'), icon: Droplets },
    { key: 'ph', value: 7.8, decimals: 1, label: t('pH (PCRWR lab)', 'pH (PCRWR لیب)'), icon: FlaskConical },
    { key: 'tds', value: 130, label: t('TDS mg/L (PCRWR lab)', 'TDS mg/L (PCRWR لیب)'), icon: ShieldCheck },
    { key: 'ecoli', value: 0, label: t('E. coli & coliforms', 'ای کولائی اور کولیفارم'), icon: Award },
  ];

  const FEATURES = [
    { key: 'pfa', icon: ShieldCheck, tint: 'green' as const, title: t('Punjab Food Authority licensed', 'پنجاب فوڈ اتھارٹی سے لائسنس یافتہ'), desc: t('Produced under a PFA licence at our own plant in Gujranwala.', 'گوجرانوالہ میں ہمارے اپنے پلانٹ پر PFA لائسنس کے تحت تیار کیا جاتا ہے۔') },
    { key: 'lab', icon: FlaskConical, tint: 'cyan' as const, title: t('Independently lab-tested', 'آزاد لیب سے ٹیسٹ شدہ'), desc: t('Tested by PCRWR (Govt. of Pakistan): “fit for drinking” on every parameter.', 'PCRWR (حکومتِ پاکستان) سے ٹیسٹ شدہ: ہر پیمانے پر ”پینے کے قابل“۔') },
    { key: 'ro', icon: Factory, tint: 'blue' as const, title: t('RO-purified, mineral-balanced', 'آر او (RO) سے صاف، متوازن منرلز'), desc: t('Reverse osmosis, UV and ozone — then essential minerals added back for taste.', 'آر او (RO)، UV اور اوزون سے صفائی — پھر ذائقے کے لیے ضروری منرلز دوبارہ شامل کیے جاتے ہیں۔') },
    { key: 'halal', icon: Award, tint: 'violet' as const, title: t('Halal & ISO 9001 certified', 'حلال اور ISO 9001 سرٹیفائیڈ'), desc: t('Halal certified by HMCA, with an ISO 9001:2015 quality management system.', 'HMCA سے حلال سرٹیفائیڈ، اور ISO 9001:2015 کوالٹی مینجمنٹ سسٹم کے ساتھ۔') },
  ];

  return (
    <div className="ow-page">
      <Seo
        path="/"
      />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20 0%, #011628 55%, #030d1a 100%)' }}>
        <img src={heroPoster} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-40" {...{ fetchpriority: "high" }} />
        {playVideo && (
          <video src="/hero_loop.mp4" poster={heroPoster} autoPlay loop muted playsInline preload="metadata" aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(3,13,26,0.35) 0%, rgba(3,13,26,0.85) 75%)' }} />
        <Bubbles count={18} />

        {/* Top-left brand mark + slogan */}
        <div className="absolute top-24 left-4 lg:left-8 z-30 flex flex-col items-center text-center gap-1 sm:gap-2 animate-fade-up">
          <img src={brandLogo} alt={t('One Water Pakistan logo', 'ون واٹر پاکستان کا لوگو')} width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-full" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium tracking-[0.1em] rtl:tracking-normal uppercase text-white/90" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{t('One Water Pakistan', 'ون واٹر پاکستان')}</span>
          <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wide rtl:tracking-normal ow-cyan" style={{ textShadow: '0 0 15px rgba(0,212,255,0.6), 0 2px 4px rgba(0,0,0,0.6)' }}>{t('“Quality is our Identity”', '”کوالٹی ہماری پہچان ہے“')}</span>
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-[13.5rem] sm:pt-40 lg:pt-36 pb-16 text-center">
          <span className="ow-eyebrow animate-fade-up" style={{ animationDelay: '80ms' }}>
            <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span>
            {t(`Now delivering across ${city}`, `اب پورے ${cityUr} میں ڈیلیوری`)}
          </span>

          <h1 className="font-heading font-black text-white leading-[1.05] mt-6 mb-6 animate-fade-up" style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)', animationDelay: '160ms', textShadow: '0 0 80px rgba(0,212,255,0.3)' }}>
            {t('Pure water,', 'خالص پانی،')}<br />
            <span className="ow-gradient-text">{t('delivered to your door.', 'آپ کی دہلیز تک۔')}</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ color: 'rgba(200,230,255,0.82)', animationDelay: '240ms' }}>
            {t(
              `10-stage purified, PCRWR lab-tested drinking water from our own plant in ${city}. 19L dispenser bottles and bottled water — order online or on WhatsApp, pay cash on delivery.`,
              `${cityUr} میں ہمارے اپنے پلانٹ سے 10 مراحل میں صاف کیا گیا، PCRWR لیب سے ٹیسٹ شدہ پینے کا پانی۔ 19 لیٹر ڈسپنسر بوتلیں اور بوتل بند پانی — آن لائن یا واٹس ایپ پر آرڈر کریں، کیش آن ڈیلیوری۔`,
            )}
          </p>

          {dispenser && (
            <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 rounded-full text-sm animate-fade-up" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', animationDelay: '300ms' }}>
              <span className="text-white font-semibold">{t('19L bottle', '19 لیٹر بوتل')} <bdi>{pkr(dispenser.price)}</bdi></span>
              {freeDelivery && <span className="text-emerald-300">· {t('Free delivery', 'فری ڈیلیوری')}</span>}
              <span className="ow-muted">· {t('Swap your empty, no deposit', 'اپنی خالی بوتل واپس کریں، کوئی سیکیورٹی نہیں')}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <Link to="/delivery" className="ow-btn !rounded-full !px-8 !py-4 text-lg w-full sm:w-auto">
              {t('Order 19L delivery', '19 لیٹر ڈیلیوری آرڈر کریں')} <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp !rounded-full !px-8 !py-4 text-lg w-full sm:w-auto">
              <WhatsAppIcon /> {t('Order on WhatsApp', 'واٹس ایپ پر آرڈر کریں')}
            </a>
          </div>

          <div className="mt-5 animate-fade-up"><OrderAgain /></div>
          <TrustRow compact className="justify-center mt-8 animate-fade-up" />
        </div>
        <div className="absolute bottom-0 inset-x-0"><WaveDivider /></div>
      </section>

      {/* ═══ PROOF STATS (real numbers only) ═══ */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <CardGrid cols={4} compactMobile>
            {STATS.map((s) => <StatCard key={s.key} icon={s.icon} value={<CountUp to={s.value} decimals={s.decimals} />} label={s.label} />)}
          </CardGrid>
        </div>
        <p className="text-center text-xs ow-subtle mt-4"><Link to="/quality" className="hover:underline">{t('Source: PCRWR lab report, March 2026 →', 'ماخذ: PCRWR لیب رپورٹ، مارچ 2026 ←')}</Link></p>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={<><Droplets className="w-4 h-4" /> {t('Our products', 'ہماری پروڈکٹس')}</>} title={isUrdu ? <>اپنا <span className="ow-gradient-text">ون واٹر</span> چنیں</> : <>Choose your <span className="ow-gradient-text">One Water</span></>} subtitle={t('Add to cart and check out in a minute — or send your order on WhatsApp.', 'کارٹ میں شامل کریں اور ایک منٹ میں چیک آؤٹ کریں — یا اپنا آرڈر واٹس ایپ پر بھیج دیں۔')} />
          {productCount > 3 ? (
            <Reveal>
              <Carousel key={isUrdu ? 'rtl' : 'ltr'} opts={{ align: 'start', loop: true, direction: isUrdu ? 'rtl' : 'ltr' }} plugins={[autoplay.current]} className="max-w-6xl mx-auto">
                <CarouselContent className="-ms-4">
                  {isLoading && Array.from({ length: 4 }).map((_, i) => (
                    <CarouselItem key={i} className="ps-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"><div className="ow-card aspect-[3/4] animate-pulse" /></CarouselItem>
                  ))}
                  {products?.map((p) => (
                    <CarouselItem key={p.id} className="ps-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"><ProductCard product={p} /></CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className={`hidden md:flex ${isUrdu ? '-right-4 left-auto rotate-180' : '-left-4'} bg-cyan-400/10 border-cyan-400/30 text-cyan-300`} />
                <CarouselNext className={`hidden md:flex ${isUrdu ? '-left-4 right-auto rotate-180' : '-right-4'} bg-cyan-400/10 border-cyan-400/30 text-cyan-300`} />
              </Carousel>
            </Reveal>
          ) : (
            <div className={`grid gap-5 mx-auto ${productCount <= 1 ? 'max-w-sm' : productCount === 2 ? 'max-w-2xl sm:grid-cols-2' : 'max-w-4xl sm:grid-cols-3'}`}>
              {products?.map((p, i) => <Reveal key={p.id} delay={i * 100}><ProductCard product={p} /></Reveal>)}
              {!dispenser && !isLoading && (
                <Reveal delay={150}>
                  <Link to="/delivery" className="ow-card ow-card-hover p-6 h-full flex flex-col justify-center text-center gap-3">
                    <Truck className="w-10 h-10 ow-cyan mx-auto" />
                    <p className="font-heading font-bold text-white text-lg">{t('Need 19L bottles?', '19 لیٹر بوتلیں چاہئیں؟')}</p>
                    <p className="text-sm ow-muted">{t(`Home & office delivery across ${city}.`, `پورے ${cityUr} میں گھر اور دفتر تک ڈیلیوری۔`)}</p>
                    <span className="ow-cyan text-sm font-semibold">{t('Order 19L →', '19 لیٹر آرڈر کریں ←')}</span>
                  </Link>
                </Reveal>
              )}
            </div>
          )}
          <Reveal className="text-center mt-10">
            <Link to="/products" className="ow-btn-ghost !rounded-full">{t('See all products & prices', 'تمام پروڈکٹس اور قیمتیں دیکھیں')} <ArrowRight className="w-4 h-4 rtl:rotate-180" /></Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={t('How it works', 'طریقہ کار')} title={isUrdu ? <><span className="ow-gradient-text">3 آسان مراحل</span> میں پانی آپ کی دہلیز پر</> : <>Water at your door in <span className="ow-gradient-text">3 simple steps</span></>} />
          <HowItWorks />
        </div>
      </section>

      {/* ═══ WHY ONE WATER ═══ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={<><Award className="w-4 h-4" /> {t('Why One Water', 'ون واٹر کیوں')}</>} title={isUrdu ? <>ایسی کوالٹی جو آپ <span className="ow-gradient-text">خود چیک کر سکیں</span></> : <>Quality you can <span className="ow-gradient-text">check for yourself</span></>} subtitle={t('No vague promises — our licences, certificates and lab report are all on our Quality page.', 'کوئی گول مول وعدے نہیں — ہمارے لائسنس، سرٹیفکیٹ اور لیب رپورٹ سب ہمارے کوالٹی پیج پر موجود ہیں۔')} />
          <CardGrid cols={4} className="max-w-6xl mx-auto">
            {FEATURES.map((f) => <FeatureCard key={f.key} icon={f.icon} tint={f.tint} title={f.title}>{f.desc}</FeatureCard>)}
          </CardGrid>
          <Reveal className="text-center mt-10">
            <Link to="/quality" className="ow-btn-ghost !rounded-full"><FlaskConical className="w-4 h-4" /> {t('See the lab report & certificates', 'لیب رپورٹ اور سرٹیفکیٹ دیکھیں')}</Link>
          </Reveal>
        </div>
      </section>

      <ClientsMarquee />

      {/* ═══ CURRENT OFFER (from admin) ═══ */}
      {offer && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Reveal className="ow-card p-8 md:p-10 relative overflow-hidden text-center" >
              <Bubbles count={8} className="opacity-50" />
              <span className="ow-eyebrow mb-4"><Tag className="w-4 h-4" /> {offer.badge_text || t('Current offer', 'موجودہ آفر')}</span>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-white mt-4 mb-3">{offer.title} — <span className="ow-gradient-text">{offer.discount_text}</span></h2>
              <p className="ow-muted max-w-xl mx-auto mb-6"><span dir="auto">{offer.description}</span></p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {offer.promo_code && <code dir="ltr" className="font-mono font-bold tracking-widest ow-cyan px-5 py-3 rounded-xl border border-dashed border-cyan-400/40">{offer.promo_code}</code>}
                <Link to="/offers" className="ow-btn">{t('Use this offer', 'یہ آفر استعمال کریں')} <ArrowRight className="w-4 h-4 rtl:rotate-180" /></Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ WHATSAPP ORDER BUILDER ═══ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow={<><WhatsAppIcon className="w-4 h-4" /> {t('Order on WhatsApp', 'واٹس ایپ پر آرڈر کریں')}</>} title={t('Build your order, send it in one tap', 'اپنا آرڈر بنائیں، ایک ٹیپ میں بھیج دیں')} subtitle={isUrdu ? <>ہمارے زیادہ تر کسٹمرز واٹس ایپ پر آرڈر کرتے ہیں۔ جو چاہیے چنیں — ہم اوقاتِ کار میں جواب دیتے ہیں (<bdi>{settings.contact_info.hours}</bdi>)۔</> : `Most of our customers order on WhatsApp. Pick what you need — we reply during business hours (${settings.contact_info.hours}).`} />
          <Reveal><OrderBuilder /></Reveal>
          <Reveal className="grid grid-cols-3 gap-3 mt-6 text-center text-xs sm:text-sm">
            {[
              { key: 'cod', icon: Wallet, label: t('Cash on delivery', 'کیش آن ڈیلیوری') },
              { key: 'delivery', icon: Truck, label: freeDelivery ? t('Free delivery', 'فری ڈیلیوری') : t('Doorstep delivery', 'دہلیز تک ڈیلیوری') },
              { key: 'city', icon: MapPin, label: t(`All of ${city}`, `پورا ${cityUr}`) },
            ].map(({ key, icon: Icon, label }) => (
              <span key={key} className="ow-muted flex flex-col sm:flex-row items-center justify-center gap-1.5"><Icon className="w-4 h-4 ow-cyan" /> {label}</span>
            ))}
          </Reveal>
        </div>
      </section>

      <Testimonials />

      {/* ═══ FAQ ═══ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={t('Questions', 'سوالات')} title={t('Before you order', 'آرڈر سے پہلے')} subtitle={t('Straight answers to what our customers ask most.', 'ہمارے کسٹمرز کے سب سے عام سوالات کے سیدھے جواب۔')} />
          <Faq />
        </div>
      </section>

      {/* ═══ EXPANSION ═══ */}
      <section className="py-20 relative overflow-hidden">
        <Bubbles count={10} className="opacity-40" />
        <div className="container mx-auto px-4 max-w-3xl relative">
          <SectionHeading
            eyebrow={<><MapPin className="w-4 h-4" /> {t(`${city} today · Pakistan next`, `آج ${cityUr} · آگے پاکستان`)}</>}
            title={isUrdu ? <>کیا آپ <span className="ow-gradient-text">اپنے شہر میں</span> ون واٹر چاہتے ہیں؟</> : <>Want One Water <span className="ow-gradient-text">in your city?</span></>}
            subtitle={t(`We started in ${city} and we're growing across Pakistan. Tell us where you live — cities with the most requests get One Water first.`, `ہم نے ${cityUr} سے آغاز کیا ہے اور پورے پاکستان میں بڑھ رہے ہیں۔ ہمیں بتائیں آپ کہاں رہتے ہیں — جن شہروں سے سب سے زیادہ درخواستیں آئیں گی، وہاں ون واٹر پہلے پہنچے گا۔`)}
          />
          <Reveal className="ow-card p-6"><WaitlistForm /></Reveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <Reveal className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center" >
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #003049 0%, #00507a 50%, #003049 100%)' }} />
            <Bubbles count={12} />
            <div className="relative">
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">{t("Thirsty? We're one tap away.", 'پیاس لگی ہے؟ ہم بس ایک ٹیپ کی دوری پر ہیں۔')}</h2>
              <p className="text-lg mb-8" style={{ color: 'rgba(220,240,255,0.85)' }}>{t('Order now and pay cash when your water arrives.', 'ابھی آرڈر کریں اور پانی پہنچنے پر کیش ادا کریں۔')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/delivery" className="ow-btn !rounded-full !px-8 !py-4 w-full sm:w-auto">{t('Order 19L delivery', '19 لیٹر ڈیلیوری آرڈر کریں')}</Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp !rounded-full !px-8 !py-4 w-full sm:w-auto"><WhatsAppIcon /> {t('WhatsApp us', 'واٹس ایپ کریں')}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
