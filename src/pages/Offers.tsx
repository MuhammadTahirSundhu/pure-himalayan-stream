import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Tag, Clock, Gift, Percent, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useOffers } from '@/hooks/useOffers';

const CYAN = '#00d4ff';

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

export default function Offers() {
  const { addItem } = useCart();
  const { data: offers = [], isLoading } = useOffers();

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Tag className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Exclusive Deals</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
            Special{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Offers
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Exclusive deals on premium Himalayan water. Use promo codes at checkout!
          </p>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[350px] rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {offers.map((offer, i) => (
                <FadeIn key={offer.id} delay={i * 100}>
                <div
                  className="rounded-2xl overflow-hidden h-full flex flex-col group transition-all duration-400"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(0,212,255,0.12)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.35)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.05)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,212,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.12)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="p-6 flex flex-col flex-grow relative overflow-hidden">
                    {/* Background glow behind image */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                      style={{ background: `radial-gradient(circle, ${CYAN} 0%, transparent 70%)` }} />
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="space-y-1.5">
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                          style={{ background: 'rgba(0,212,255,0.1)', color: offer.icon_color || CYAN, border: '1px solid rgba(0,212,255,0.2)' }}>
                          {offer.badge_text}
                        </span>
                        <h3 className="font-heading font-bold text-xl text-white">{offer.title}</h3>
                      </div>
                      <div className="w-16 h-16 shrink-0 ml-4 drop-shadow-2xl">
                        <img src={offer.image_url} alt="" className="w-full h-full object-contain filter group-hover:scale-110 transition-transform" />
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'rgba(150,200,255,0.7)' }}>
                      {offer.description}
                    </p>

                    <div className="mt-auto space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        {offer.original_price > 0 ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm line-through decoration-red-500/50" style={{ color: 'rgba(150,200,255,0.4)' }}>
                              PKR {offer.original_price}
                            </span>
                            <span className="font-heading font-bold text-2xl text-white">
                              PKR {offer.sale_price}
                            </span>
                          </div>
                        ) : (
                          <span className="font-heading font-bold text-xl text-white">Discount applies at checkout</span>
                        )}
                        <span className="text-sm font-bold flex items-center gap-1" style={{ color: CYAN }}>
                          <Percent className="w-4 h-4" /> {offer.discount_text}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border border-dashed"
                        style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(0,212,255,0.3)' }}>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" style={{ color: CYAN }} />
                          <span className="text-xs" style={{ color: 'rgba(150,200,255,0.6)' }}>Promo Code:</span>
                        </div>
                        <code className="font-mono font-bold text-base tracking-wider" style={{ color: CYAN }}>
                          {offer.promo_code}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
