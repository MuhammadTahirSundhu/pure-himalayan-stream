import { Mountain, Leaf, Shield, Users, Clock, Zap, Award } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import aboutHero from '@/assets/brand/about-hero.jpg';

const CYAN = '#00d4ff';

const timeline = [
  { year: '2020', title: 'Founded',          desc: 'One Water established in Gujranwala with a vision for pure, affordable hydration.' },
  { year: '2021', title: 'PSQCA Certified',  desc: 'Achieved full PSQCA certification and began commercial production.' },
  { year: '2022', title: 'Delivery Expanded',desc: 'Launched 19L home delivery across Gujranwala, Lahore, and Islamabad.' },
  { year: '2023', title: 'Eco Initiative',   desc: 'Introduced recyclable bottles and carbon-neutral delivery vehicles.' },
  { year: '2024', title: 'National Growth',  desc: 'Available in 50+ cities. Trusted by over 100,000 families.' },
  { year: '2026', title: 'Digital First',    desc: 'Launched online ordering and subscription platform for nationwide delivery.' },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function About() {
  const values = [
    { icon: Mountain, label: 'Himalayan Source', value: 'Glacial Springs',     color: 'from-cyan-500/20 to-cyan-700/5',  ic: 'text-cyan-400' },
    { icon: Shield,   label: 'PSQCA Certified',  value: '100% Compliant',      color: 'from-blue-500/20 to-blue-700/5',  ic: 'text-blue-400' },
    { icon: Leaf,     label: 'Eco-Friendly',     value: 'Recyclable Bottles',  color: 'from-emerald-500/20 to-emerald-700/5', ic: 'text-emerald-400' },
    { icon: Users,    label: 'Families Served',  value: '100,000+',            color: 'from-violet-500/20 to-violet-700/5', ic: 'text-violet-400' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>

      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <img src={aboutHero} alt="Himalayan valley" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.2, mixBlendMode: 'luminosity' }} loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(3,13,26,0.5) 0%, rgba(3,13,26,0.85) 100%)' }} />
        {/* Glow orb */}
        <div className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)' }} />
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <Award className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Our Story</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-6xl text-white mb-3"
            style={{ textShadow: '0 0 60px rgba(0,212,255,0.2)' }}>
            Born from the{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Himalayas
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>Made for Pakistan</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #030D1A)' }} />
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Zap className="w-4 h-4" style={{ color: CYAN }} />
                <span className="text-sm font-medium" style={{ color: CYAN }}>Why One Water?</span>
              </div>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-5">
                Pure Hydration,{' '}
                <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Uncompromised
                </span>
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'rgba(150,200,255,0.75)' }}>
                One Water was born from a simple belief: every Pakistani deserves access to safe,
                pure, and affordable drinking water. Sourced from pristine Himalayan glaciers and
                purified through a 10-step process, we bring nature's best to your doorstep.
              </p>
              <p className="leading-relaxed" style={{ color: 'rgba(150,200,255,0.65)' }}>
                Based in Gujranwala, our state-of-the-art plant processes water that meets and exceeds
                PSQCA standards. From our family to yours — pure, transparent, Pakistani.
              </p>
            </FadeIn>

            <div className="grid grid-cols-2 gap-4">
              {values.map((stat, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div
                    className="relative p-5 rounded-2xl text-center transition-all duration-300 group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(12px)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className={`w-6 h-6 ${stat.ic}`} />
                    </div>
                    <p className="font-heading font-bold text-sm text-white">{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(150,200,255,0.6)' }}>{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative" style={{ background: 'linear-gradient(180deg, #030D1A 0%, #041422 50%, #030D1A 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }} />
        <div className="container mx-auto px-4 max-w-3xl">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Clock className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-sm font-medium" style={{ color: CYAN }}>Our Journey</span>
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white">
              Growing{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Stronger
              </span>{' '}Every Year
            </h2>
          </FadeIn>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex gap-6 group">
                  {/* Timeline node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(59,130,246,0.15))',
                        border: '1px solid rgba(0,212,255,0.35)',
                        boxShadow: '0 0 16px rgba(0,212,255,0.15)',
                      }}
                    >
                      <span className="text-xs font-black" style={{ color: CYAN }}>{item.year}</span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 mt-2" style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.3), rgba(0,212,255,0.05))' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-8 pt-2">
                    <h3 className="font-heading font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(150,200,255,0.65)' }}>{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }} />
      </section>
    </div>
  );
}
