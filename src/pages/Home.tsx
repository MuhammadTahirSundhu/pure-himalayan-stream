import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import {
  ChevronRight, FlaskConical, ShieldCheck, Truck, Droplets,
  Star, Zap, Mountain, Award, ArrowRight, Play,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import ClientsMarquee from '@/components/ClientsMarquee';
import heroBg from '@/assets/brand/hero-bg.jpg';

// ─── Floating Orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ size, x, y, delay, duration, opacity = 0.15 }: {
  size: number; x: string; y: string; delay: number; duration: number; opacity?: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: x, top: y,
        background: `radial-gradient(circle, rgba(0,212,255,${opacity}) 0%, transparent 70%)`,
        animation: `floatOrb ${duration}s ease-in-out ${delay}s infinite alternate`,
        filter: 'blur(1px)',
      }}
    />
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(t); }
          else setVal(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Section Reveal ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Hexagonal Grid SVG Background ────────────────────────────────────────────
function HexGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,1 58,15 58,37 30,51 2,37 2,15" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

// ─── Vertical Tank-Chain Strip ────────────────────────────────────────────────
function VerticalClientStrip({ direction = 'up', side = 'left' }: { direction?: 'up' | 'down'; side?: 'left' | 'right' }) {
  const [clients, setClients] = useState<Array<{ id: string; name: string; logo_url: string | null }>>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (clients.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    const speed = 0.6;
    const halfH = () => track.scrollHeight / 2;
    posRef.current = direction === 'up' ? 0 : -halfH();

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current += direction === 'up' ? -speed : speed;
        if (direction === 'up' && posRef.current <= -halfH()) posRef.current = 0;
        if (direction === 'down' && posRef.current >= 0) posRef.current = -halfH();
        track.style.transform = `translateY(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [clients, direction]);

  const displayClients = Array(30).fill(clients).flat();
  const initials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  function nameToGradient(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${(h1 + 40) % 360},80%,45%))`;
  }

  if (clients.length === 0) return null;

  const posStyle: React.CSSProperties = side === 'left'
    ? { left: 0, top: 0, bottom: 0 }
    : { right: 0, top: 0, bottom: 0 };

  return (
    <div
      className="absolute flex flex-col items-center overflow-hidden pointer-events-none z-20 w-[75px] md:w-[110px] xl:w-[155px]"
      style={{
        ...posStyle,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex flex-col gap-2 md:gap-3 xl:gap-4 py-4 will-change-transform pointer-events-auto px-1 md:px-2 xl:px-3">
        {displayClients.map((c, i) => (
          <div
            key={`${c.id}-${i}`}
            title={c.name}
            className="shrink-0 rounded-xl xl:rounded-2xl flex flex-col items-center justify-center gap-1 xl:gap-2 cursor-default w-[65px] h-[75px] md:w-[95px] md:h-[105px] xl:w-[125px] xl:h-[135px]"
            style={{
              background: 'rgba(0,18,40,0.75)',
              border: '1px solid rgba(0,212,255,0.22)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(0,212,255,0.65)';
              el.style.background = 'rgba(0,212,255,0.13)';
              el.style.transform = 'scale(1.1)';
              el.style.boxShadow = '0 8px 32px rgba(0,212,255,0.28), inset 0 1px 0 rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(0,212,255,0.22)';
              el.style.background = 'rgba(0,18,40,0.75)';
              el.style.transform = 'scale(1)';
              el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)';
            }}
          >
            {c.logo_url ? (
              <img
                src={c.logo_url}
                alt={c.name}
                className="w-8 h-8 md:w-12 md:h-12 xl:w-16 xl:h-16 object-contain rounded-lg xl:rounded-xl"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-8 h-8 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-lg xl:rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-lg xl:text-xl font-heading"
              style={{ background: nameToGradient(c.name), display: c.logo_url ? 'none' : 'flex' }}
            >
              {initials(c.name)}
            </div>
            <span
              className="text-[7px] md:text-[9px] xl:text-[10px] font-semibold text-center leading-tight px-1 xl:px-2 w-full"
              style={{
                color: 'rgba(180,220,255,0.9)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              } as React.CSSProperties}
            >
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { data: products, isLoading } = useProducts();

  const stats = [
    { icon: Droplets,    value: 99.9,   suffix: '%', label: 'Purity Level',       color: 'from-cyan-400 to-cyan-600' },
    { icon: Mountain,    value: 5000,   suffix: 'm+', label: 'Himalayan Altitude', color: 'from-sky-400 to-sky-600' },
    { icon: FlaskConical,value: 47,     suffix: '+',  label: 'Lab Tests Passed',   color: 'from-blue-400 to-blue-600' },
    { icon: Truck,       value: 50,     suffix: '+',  label: 'Cities Covered',     color: 'from-indigo-400 to-indigo-600' },
  ];

  const features = [
    {
      icon: ShieldCheck, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      title: 'PFA Licensed & Certified',
      desc: 'Every batch certified by the Punjab Food Authority. Zero compromise on safety.',
    },
    {
      icon: FlaskConical, color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      title: 'PCRWR Government Lab Tested',
      desc: 'Independently tested at Pakistan Council of Research in Water Resources.',
    },
    {
      icon: Zap, color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      title: 'Natural Mineral Balance',
      desc: 'Rich in calcium, magnesium and potassium — exactly as nature intended.',
    },
    {
      icon: Star, color: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/30',
      iconColor: 'text-violet-400',
      title: 'ISO 9001:2015 Certified',
      desc: 'Our entire production process meets international quality management standards.',
    },
  ];

  return (
    <div style={{ background: '#030D1A' }}>

      {/* ═══════════════════════════════════════════ HERO ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20 0%, #011628 50%, #030D1A 100%)' }}>
        {/* Left vertical client strip - slides UP */}
        <VerticalClientStrip direction="up" side="left" />

        {/* Right vertical client strip - slides DOWN */}
        <VerticalClientStrip direction="down" side="right" />

        {/* Background video with overlay */}
        <video
          src="/hero_loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        />

        {/* Hex grid */}
        <HexGrid />

        {/* Floating glowing orbs */}
        <FloatingOrb size={500} x="60%" y="-10%" delay={0}   duration={8}  opacity={0.12} />
        <FloatingOrb size={300} x="10%" y="30%" delay={2}   duration={10} opacity={0.10} />
        <FloatingOrb size={200} x="75%" y="60%" delay={1}   duration={7}  opacity={0.14} />
        <FloatingOrb size={150} x="30%" y="70%" delay={3}   duration={9}  opacity={0.08} />

        {/* Radial glow behind text */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 900, height: 600,
            left: '50%', top: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-24">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.3)',
              backdropFilter: 'blur(12px)',
              animation: 'fadeSlideDown 0.8s ease forwards',
            }}
          >
            <Mountain className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: '#00d4ff' }}>
              Provide quality drinking water
            </span>
          </div>

          {/* Headline */}
          <div style={{ animation: 'fadeSlideDown 0.8s ease 0.15s forwards', opacity: 0 }}>
            <h1
              className="font-heading font-black leading-none mb-6"
              style={{
                fontSize: 'clamp(3rem, 9vw, 7rem)',
                color: '#fff',
                textShadow: '0 0 80px rgba(0,212,255,0.3)',
              }}
            >
              Pure.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.5))',
                }}
              >
                Transparent.
              </span>
              <br />
              Pakistani.
            </h1>
          </div>

          {/* Subtext */}
          <div style={{ animation: 'fadeSlideDown 0.8s ease 0.3s forwards', opacity: 0 }}>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'rgba(200,230,255,0.75)' }}
            >
              Premium Himalayan mineral water — naturally filtered through ancient glaciers
              over thousands of years, lab-certified, and delivered fresh to your doorstep.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            style={{ animation: 'fadeSlideDown 0.8s ease 0.45s forwards', opacity: 0 }}
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0284c7)',
                boxShadow: '0 0 30px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 50px rgba(0,212,255,0.7), 0 4px 30px rgba(0,0,0,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.4)')}
            >
              Order Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/quality"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.35)',
                color: '#00d4ff',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.16)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)'; }}
            >
              <Play className="w-4 h-4" />
              View Lab Reports
            </Link>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ animation: 'fadeIn 1s ease 1s forwards', opacity: 0 }}
          >
            <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(0,212,255,0.5)' }}>Scroll</span>
            <div
              className="w-px h-12 rounded-full"
              style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)', animation: 'pulse 2s ease infinite' }}
            />
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #030D1A)' }}
        />
      </section>

      {/* ═══════════════════════════════════════════ STATS ═════════════════════════════════════ */}
      <section className="py-16 relative" style={{ background: '#030D1A' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 100}>
                <div
                  className="relative flex flex-col items-center gap-3 p-6 rounded-2xl text-center group transition-all duration-500"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(0,212,255,0.12)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,212,255,0.35)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,212,255,0.12)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}
                    style={{ boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-black text-3xl text-white">
                      <AnimatedNumber target={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(150,200,255,0.7)' }}>{s.label}</p>
                  </div>
                  {/* Corner glow */}
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-tr-2xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(0,212,255,0.08), transparent)' }} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ PRODUCTS ══════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030D1A 0%, #041422 50%, #030D1A 100%)' }}>
        {/* Faint hex grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
          <HexGrid />
        </div>

        {/* Glow sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Droplets className="w-4 h-4" style={{ color: '#00d4ff' }} />
              <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>Premium Selection</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
              Our{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Products
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(150,200,255,0.7)' }}>
              From pocket-sized 300ml to family 19L dispensers — pure Himalayan hydration for every need.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <Carousel
              opts={{ align: 'start', loop: true }}
              plugins={[autoplay.current]}
              className="max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <CarouselItem key={i} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="rounded-2xl overflow-hidden animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                      <div className="aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="p-5 space-y-3">
                        <div className="h-4 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="flex justify-between pt-1">
                          <div className="h-5 rounded w-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
                          <div className="h-8 rounded w-24" style={{ background: 'rgba(0,212,255,0.12)' }} />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
                {products?.map(p => (
                  <CarouselItem key={p.id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard product={p} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }} />
              <CarouselNext className="hidden md:flex -right-4"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }} />
            </Carousel>
          </FadeIn>

          <FadeIn delay={200} className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.3)',
                color: '#00d4ff',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)'; }}
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ WHY US ════════════════════════════════════ */}
      <section className="py-20 relative" style={{ background: '#030D1A' }}>
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Award className="w-4 h-4" style={{ color: '#00d4ff' }} />
              <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>Why Choose OneWater</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
              Certified{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Excellence
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(150,200,255,0.7)' }}>
              Every bottle carries the stamp of authority, rigorous science, and uncompromising quality.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 100}>
                <div
                  className={`relative p-6 rounded-2xl h-full group transition-all duration-400 ${f.border}`}
                  style={{
                    background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,20,40,0.6))`,
                    border: `1px solid`,
                    borderColor: 'rgba(0,212,255,0.12)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}
                    style={{ border: `1px solid` }}>
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(150,200,255,0.65)' }}>{f.desc}</p>

                  {/* Top-right corner accent */}
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.8)', opacity: 0.6 }} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ CLIENTS ═══════════════════════════════════ */}
      <div style={{ background: '#030D1A' }}>
        <ClientsMarquee />
      </div>

      {/* ═══════════════════════════════════════════ PROMO BANNER ══════════════════════════════ */}
      <FadeIn>
        <section className="py-20 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #001a2e 0%, #002a40 50%, #001a2e 100%)',
        }}>
          {/* Animated border glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(0,212,255,0.04) 50%, transparent 100%)',
          }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />

          {/* Floating orbs */}
          <FloatingOrb size={350} x="-10%" y="50%" delay={0} duration={8} opacity={0.08} />
          <FloatingOrb size={250} x="90%" y="20%" delay={2} duration={7} opacity={0.07} />

          <div className="container mx-auto px-4 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Zap className="w-4 h-4" style={{ color: '#00d4ff' }} />
              <span className="text-sm font-semibold" style={{ color: '#00d4ff' }}>Limited Time Offer</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
              🎉 Eid Special —{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                15% Off
              </span>{' '}
              All Orders!
            </h2>
            <p className="mb-8 text-lg max-w-lg mx-auto" style={{ color: 'rgba(150,200,255,0.75)' }}>
              Use code{' '}
              <span
                className="font-black font-mono px-4 py-1.5 rounded-lg mx-1 text-white"
                style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', boxShadow: '0 0 20px rgba(0,212,255,0.2)', letterSpacing: '0.1em' }}
              >
                EID2026
              </span>
              {' '}at checkout. Limited time offer.
            </p>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0284c7)',
                boxShadow: '0 0 30px rgba(0,212,255,0.4)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(0,212,255,0.7)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              View All Offers <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════ DELIVERY CTA ══════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#030D1A' }}>
        <HexGrid />

        <FloatingOrb size={400} x="50%" y="50%" delay={0} duration={10} opacity={0.06} />

        <div className="container mx-auto px-4 relative">
          <FadeIn>
            <div
              className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(0,212,255,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Corner glow accents */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-tl-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at 0% 0%, rgba(0,212,255,0.15), transparent)' }} />
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-br-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 100%, rgba(59,130,246,0.15), transparent)' }} />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Truck className="w-4 h-4" style={{ color: '#00d4ff' }} />
                <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>Home Delivery</span>
              </div>

              <h2 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
                Need 19L Home Delivery?
              </h2>
              <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'rgba(150,200,255,0.7)' }}>
                Subscribe for weekly or bi-weekly delivery.{' '}
                <span className="text-white font-semibold">PKR 250</span> per refill,{' '}
                <span className="text-white font-semibold">PKR 1,000</span> refundable bottle deposit.
              </p>
              <Link
                to="/delivery"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #0284c7)',
                  boxShadow: '0 0 30px rgba(0,212,255,0.3)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(0,212,255,0.6)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Start Subscription <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
