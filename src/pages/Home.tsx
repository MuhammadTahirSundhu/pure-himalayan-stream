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
import heroPoster from '@/assets/brand/hero-bg.jpg';
import brandLogo from '@/assets/media/2.jpeg';

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

const STATS = [
  { value: 10, label: 'Purification stages', icon: Droplets },
  { value: 7.8, decimals: 1, label: 'pH (PCRWR lab)', icon: FlaskConical },
  { value: 130, label: 'TDS mg/L (PCRWR lab)', icon: ShieldCheck },
  { value: 0, label: 'E. coli & coliforms', icon: Award },
];

const FEATURES = [
  { icon: ShieldCheck, tint: 'text-emerald-400', title: 'Punjab Food Authority licensed', desc: 'Produced under a PFA licence at our own plant in Gujranwala.' },
  { icon: FlaskConical, tint: 'text-cyan-400', title: 'Independently lab-tested', desc: 'Tested by PCRWR (Govt. of Pakistan): “fit for drinking” on every parameter.' },
  { icon: Factory, tint: 'text-blue-400', title: 'RO-purified, mineral-balanced', desc: 'Reverse osmosis, UV and ozone — then essential minerals added back for taste.' },
  { icon: Award, tint: 'text-violet-400', title: 'Halal & ISO 9001 certified', desc: 'Halal certified by HMCA, with an ISO 9001:2015 quality management system.' },
];

export default function Home() {
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { data: products, isLoading } = useProducts();
  const { product: dispenser } = useDispenserProduct();
  const { data: offers = [] } = useOffers();
  const { settings } = useSiteSettings();
  const playVideo = useShouldPlayVideo();
  const city = settings.service_areas.cities[0] ?? 'Gujranwala';
  const freeDelivery = !settings.delivery_info.charge_delivery;
  const wa = whatsappLink(settings.contact_info.whatsapp, 'Assalam o Alaikum One Water! I would like to order water.');
  const offer = offers[0];
  const productCount = products?.length ?? 4;

  return (
    <div className="ow-page">
      <Seo
        title="One Water | Mineral Water Delivery in Gujranwala — 19L & Bottles"
        description={`Order 10-stage purified, PCRWR lab-tested mineral water in ${city}. 19L dispenser bottles and bottled water delivered to your door. Cash on delivery or order on WhatsApp.`}
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

        <div className="relative z-10 container mx-auto px-4 pt-28 pb-16 text-center">
          <div className="flex flex-col items-center gap-1 mb-6 animate-fade-up">
            <img src={brandLogo} alt="One Water Pakistan logo" width={64} height={64} className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full" />
            <span className="text-xs sm:text-sm font-bold tracking-wide ow-cyan" style={{ textShadow: '0 0 15px rgba(0,212,255,0.6)' }}>“Quality is our Identity”</span>
          </div>

          <span className="ow-eyebrow animate-fade-up" style={{ animationDelay: '80ms' }}>
            <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span>
            Now delivering across {city}
          </span>

          <h1 className="font-heading font-black text-white leading-[1.05] mt-6 mb-6 animate-fade-up" style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)', animationDelay: '160ms', textShadow: '0 0 80px rgba(0,212,255,0.3)' }}>
            Pure water,<br />
            <span className="ow-gradient-text">delivered to your door.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ color: 'rgba(200,230,255,0.82)', animationDelay: '240ms' }}>
            10-stage purified, PCRWR lab-tested drinking water from our own plant in {city}.
            19L dispenser bottles and bottled water — order online or on WhatsApp, pay cash on delivery.
          </p>

          {dispenser && (
            <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 rounded-full text-sm animate-fade-up" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', animationDelay: '300ms' }}>
              <span className="text-white font-semibold">19L bottle {pkr(dispenser.price)}</span>
              {freeDelivery && <span className="text-emerald-300">· Free delivery</span>}
              <span className="ow-muted">· Swap your empty, no deposit</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <Link to="/delivery" className="ow-btn !rounded-full !px-8 !py-4 text-lg w-full sm:w-auto">
              Order 19L delivery <ChevronRight className="w-5 h-5" />
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp !rounded-full !px-8 !py-4 text-lg w-full sm:w-auto">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
          </div>

          <TrustRow compact className="justify-center mt-8 animate-fade-up" />
        </div>
        <div className="absolute bottom-0 inset-x-0"><WaveDivider /></div>
      </section>

      {/* ═══ PROOF STATS (real numbers only) ═══ */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="ow-card ow-card-hover p-6 text-center">
              <s.icon className="w-6 h-6 ow-cyan mx-auto mb-2" />
              <p className="font-heading font-black text-3xl md:text-4xl text-white"><CountUp to={s.value} decimals={s.decimals} /></p>
              <p className="text-sm mt-1 ow-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-xs ow-subtle mt-4"><Link to="/quality" className="hover:underline">Source: PCRWR lab report, March 2026 →</Link></p>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={<><Droplets className="w-4 h-4" /> Our products</>} title={<>Choose your <span className="ow-gradient-text">One Water</span></>} subtitle="Add to cart and check out in a minute — or send your order on WhatsApp." />
          {productCount > 3 ? (
            <Reveal>
              <Carousel opts={{ align: 'start', loop: true }} plugins={[autoplay.current]} className="max-w-6xl mx-auto">
                <CarouselContent className="-ml-4">
                  {isLoading && Array.from({ length: 4 }).map((_, i) => (
                    <CarouselItem key={i} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"><div className="ow-card aspect-[3/4] animate-pulse" /></CarouselItem>
                  ))}
                  {products?.map((p) => (
                    <CarouselItem key={p.id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"><ProductCard product={p} /></CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 bg-cyan-400/10 border-cyan-400/30 text-cyan-300" />
                <CarouselNext className="hidden md:flex -right-4 bg-cyan-400/10 border-cyan-400/30 text-cyan-300" />
              </Carousel>
            </Reveal>
          ) : (
            <div className={`grid gap-5 mx-auto ${productCount <= 1 ? 'max-w-sm' : productCount === 2 ? 'max-w-2xl sm:grid-cols-2' : 'max-w-4xl sm:grid-cols-3'}`}>
              {products?.map((p, i) => <Reveal key={p.id} delay={i * 100}><ProductCard product={p} /></Reveal>)}
              {!dispenser && !isLoading && (
                <Reveal delay={150}>
                  <Link to="/delivery" className="ow-card ow-card-hover p-6 h-full flex flex-col justify-center text-center gap-3">
                    <Truck className="w-10 h-10 ow-cyan mx-auto" />
                    <p className="font-heading font-bold text-white text-lg">Need 19L bottles?</p>
                    <p className="text-sm ow-muted">Home & office delivery across {city}.</p>
                    <span className="ow-cyan text-sm font-semibold">Order 19L →</span>
                  </Link>
                </Reveal>
              )}
            </div>
          )}
          <Reveal className="text-center mt-10">
            <Link to="/products" className="ow-btn-ghost !rounded-full">See all products & prices <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="How it works" title={<>Water at your door in <span className="ow-gradient-text">3 simple steps</span></>} />
          <HowItWorks />
        </div>
      </section>

      {/* ═══ WHY ONE WATER ═══ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={<><Award className="w-4 h-4" /> Why One Water</>} title={<>Quality you can <span className="ow-gradient-text">check for yourself</span></>} subtitle="No vague promises — our licences, certificates and lab report are all on our Quality page." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100} className="ow-card ow-card-hover p-6 h-full">
                <f.icon className={`w-8 h-8 mb-4 ${f.tint}`} />
                <h3 className="font-heading font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed ow-muted">{f.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-10">
            <Link to="/quality" className="ow-btn-ghost !rounded-full"><FlaskConical className="w-4 h-4" /> See the lab report & certificates</Link>
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
              <span className="ow-eyebrow mb-4"><Tag className="w-4 h-4" /> {offer.badge_text || 'Current offer'}</span>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-white mt-4 mb-3">{offer.title} — <span className="ow-gradient-text">{offer.discount_text}</span></h2>
              <p className="ow-muted max-w-xl mx-auto mb-6">{offer.description}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {offer.promo_code && <code className="font-mono font-bold tracking-widest ow-cyan px-5 py-3 rounded-xl border border-dashed border-cyan-400/40">{offer.promo_code}</code>}
                <Link to="/offers" className="ow-btn">Use this offer <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ WHATSAPP ORDER BUILDER ═══ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow={<><WhatsAppIcon className="w-4 h-4" /> Order on WhatsApp</>} title="Build your order, send it in one tap" subtitle={`Most of our customers order on WhatsApp. Pick what you need — we reply during business hours (${settings.contact_info.hours}).`} />
          <Reveal><OrderBuilder /></Reveal>
          <Reveal className="grid grid-cols-3 gap-3 mt-6 text-center text-xs sm:text-sm">
            {[{ icon: Wallet, t: 'Cash on delivery' }, { icon: Truck, t: freeDelivery ? 'Free delivery' : 'Doorstep delivery' }, { icon: MapPin, t: `All of ${city}` }].map(({ icon: Icon, t }) => (
              <span key={t} className="ow-muted flex flex-col sm:flex-row items-center justify-center gap-1.5"><Icon className="w-4 h-4 ow-cyan" /> {t}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Questions" title="Before you order" subtitle="Straight answers to what our customers ask most." />
          <Faq />
        </div>
      </section>

      {/* ═══ EXPANSION ═══ */}
      <section className="py-20 relative overflow-hidden">
        <Bubbles count={10} className="opacity-40" />
        <div className="container mx-auto px-4 max-w-3xl relative">
          <SectionHeading
            eyebrow={<><MapPin className="w-4 h-4" /> {city} today · Pakistan next</>}
            title={<>Want One Water <span className="ow-gradient-text">in your city?</span></>}
            subtitle={`We started in ${city} and we're growing across Pakistan. Tell us where you live — cities with the most requests get One Water first.`}
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
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Thirsty? We're one tap away.</h2>
              <p className="text-lg mb-8" style={{ color: 'rgba(220,240,255,0.85)' }}>Order now and pay cash when your water arrives.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/delivery" className="ow-btn !rounded-full !px-8 !py-4 w-full sm:w-auto">Order 19L delivery</Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp !rounded-full !px-8 !py-4 w-full sm:w-auto"><WhatsAppIcon /> WhatsApp us</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
