import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { Truck, RefreshCw, DollarSign, Package, Droplets } from 'lucide-react';
import bottle19l from '@/assets/brand/bottle-19l.png';

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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', outline: 'none',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
  color: '#fff', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function Delivery() {
  const { addItem } = useCart();
  const [schedule, setSchedule] = useState('weekly');
  const [emptyBottles, setEmptyBottles] = useState('0');
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  const refillPrice = 250;
  const deposit = 1000;

  const handleOrder = () => {
    addItem({
      id: `19l-${schedule}-${Date.now()}`,
      name: `19L Delivery (${schedule})`,
      size: '19L',
      price: refillPrice,
      image: bottle19l,
      isSubscription: true,
      schedule,
      emptyBottles: parseInt(emptyBottles) || 0,
      deposit: isFirstOrder ? deposit : undefined,
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Truck className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Subscription Service</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
            19L Home{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Delivery
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Get fresh Himalayan mineral water delivered to your home or office on a schedule that works for you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            
            {/* Image Side */}
            <FadeIn delay={100} className="flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
              <img src={bottle19l} alt="19L Bottle" className="max-h-96 object-contain relative z-10" style={{ animation: 'floatOrb 8s ease-in-out infinite alternate' }} />
            </FadeIn>

            {/* Form Side */}
            <FadeIn delay={200}>
              <div className="space-y-6">
                {/* Pricing Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4 text-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Droplets className="w-8 h-8 mx-auto mb-2" style={{ color: CYAN }} />
                    <p className="text-2xl font-heading font-bold text-white">PKR {refillPrice}</p>
                    <p className="text-sm" style={{ color: 'rgba(150,200,255,0.6)' }}>Per Refill</p>
                  </div>
                  <div className="rounded-2xl p-4 text-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Package className="w-8 h-8 mx-auto mb-2" style={{ color: '#3b82f6' }} />
                    <p className="text-2xl font-heading font-bold text-white">PKR {deposit}</p>
                    <p className="text-sm" style={{ color: 'rgba(150,200,255,0.6)' }}>Refundable Deposit</p>
                    <p className="text-xs mt-1" style={{ color: '#3b82f6' }}>First order only</p>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="space-y-5 rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Delivery Schedule</label>
                    <select
                      value={schedule}
                      onChange={e => setSchedule(e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      className="bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300d4ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_auto] bg-[position:right_16px_center]"
                    >
                      <option value="weekly" style={{ background: '#030D1A' }}>Weekly</option>
                      <option value="biweekly" style={{ background: '#030D1A' }}>Bi-weekly</option>
                      <option value="custom" style={{ background: '#030D1A' }}>Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Empty Bottles Returning</label>
                    <input
                      type="number" min="0" value={emptyBottles}
                      onChange={e => setEmptyBottles(e.target.value)}
                      placeholder="Number of empty bottles"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isFirstOrder}
                      onChange={e => setIsFirstOrder(e.target.checked)}
                      className="w-5 h-5 rounded border border-cyan-500/50 bg-transparent text-cyan-400 focus:ring-cyan-500/30 focus:ring-offset-0"
                      style={{ accentColor: CYAN }}
                    />
                    <span className="text-sm" style={{ color: 'rgba(200,230,255,0.8)' }}>This is my first order (includes bottle deposit)</span>
                  </label>
                </div>

                {/* Summary Box */}
                <div className="rounded-2xl p-5 space-y-3"
                  style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(150,200,255,0.7)' }}>Refill Cost</span>
                    <span className="font-medium text-white">PKR {refillPrice}</span>
                  </div>
                  {isFirstOrder && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(150,200,255,0.7)' }}>Bottle Deposit (refundable)</span>
                      <span className="font-medium text-white">PKR {deposit}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-heading font-bold text-lg text-white" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
                    <span>Total</span>
                    <span style={{ color: CYAN }}>PKR {refillPrice + (isFirstOrder ? deposit : 0)}</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff, #0284c7)',
                    boxShadow: '0 0 25px rgba(0,212,255,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,212,255,0.6)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(0,212,255,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <Truck className="w-5 h-5" /> Add to Cart
                </button>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-4 text-center mt-6">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <RefreshCw className="w-5 h-5 mx-auto mb-1.5" style={{ color: CYAN }} />
                    <p className="text-xs font-medium text-white">Auto-Refill</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Truck className="w-5 h-5 mx-auto mb-1.5" style={{ color: CYAN }} />
                    <p className="text-xs font-medium text-white">Free Delivery</p>
                  </div>
                </div>

              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
