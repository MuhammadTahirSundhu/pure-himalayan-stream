import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RefreshCw, Wallet, ShieldCheck, Minus, Plus, Users, Calculator, ShoppingCart } from 'lucide-react';
import { useCart, type DeliverySchedule } from '@/contexts/CartContext';
import { useDispenserProduct } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import OrderBuilder from '@/components/site/OrderBuilder';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import bottle19l from '@/assets/brand/bottle-19l.png';

const SCHEDULES: { id: DeliverySchedule; label: string }[] = [
  { id: 'once', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Every 2 weeks' },
  { id: 'monthly', label: 'Monthly' },
];

function Stepper({ value, onChange, min = 0, max = 50, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className="ow-btn-ghost !p-2.5" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease ${label}`}><Minus className="w-4 h-4" /></button>
      <span className="w-8 text-center text-xl font-bold text-white tabular-nums">{value}</span>
      <button type="button" className="ow-btn-ghost !p-2.5" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${label}`}><Plus className="w-4 h-4" /></button>
    </div>
  );
}

export default function Delivery() {
  const { setItem, setSchedule, schedule, setIsOpen } = useCart();
  const { product, isLoading } = useDispenserProduct();
  const { settings } = useSiteSettings();
  const deposit = settings.delivery_info.bottle_deposit;
  const freeDelivery = !settings.delivery_info.charge_delivery;

  const [qty, setQty] = useState(2);
  const [empties, setEmpties] = useState(0);
  const [people, setPeople] = useState(4);
  const newBottles = Math.max(0, qty - empties);
  const price = product?.price ?? 0;

  // ~2.5 L/person/day for drinking + cooking ≈ 0.92 bottles/person/week
  const bottlesPerWeek = Math.max(1, Math.ceil((people * 2.5 * 7) / 19));

  const addToCart = () => {
    if (!product) return;
    setItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image, category: 'dispenser', quantity: qty, newBottles });
    setIsOpen(true);
  };

  return (
    <div className="ow-page">
      <Seo
        title="19L Water Bottle Delivery in Gujranwala | One Water"
        description="Get 19 litre mineral water dispenser bottles delivered to your home or office in Gujranwala. Weekly or one-time delivery, refundable bottle deposit, cash on delivery."
        path="/delivery"
      />
      <PageHero
        eyebrow={<><Truck className="w-4 h-4" /> 19L Home & Office Delivery</>}
        title={<>19L bottles, <span className="ow-gradient-text">delivered to your door</span></>}
        subtitle={`Fresh 19-litre dispenser bottles anywhere in ${settings.service_areas.cities.join(', ')}. Exchange your empties and pay only for the water.`}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center max-w-5xl">
          <Reveal direction="left" className="flex justify-center relative">
            <div aria-hidden className="absolute inset-0 m-auto w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)', filter: 'blur(24px)' }} />
            <img src={product?.image ?? bottle19l} alt="One Water 19 litre dispenser bottle" width={384} height={384} className="max-h-96 object-contain relative z-10 animate-bottle-bob drop-shadow-2xl" />
          </Reveal>

          <Reveal direction="right">
            {isLoading ? (
              <div className="ow-card p-8 animate-pulse h-96" />
            ) : product ? (
              <div className="ow-card p-6 md:p-8 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm ow-muted">Price per 19L bottle</p>
                    <p className="font-heading font-black text-4xl text-white">{pkr(price)}</p>
                  </div>
                  {freeDelivery && <span className="text-xs font-bold px-3 py-1.5 rounded-full text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>Free delivery</span>}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <span className="ow-label">Bottles per delivery</span>
                    <Stepper label="bottles" value={qty} min={1} onChange={(n) => { setQty(n); setEmpties((e) => Math.min(e, n)); }} />
                  </div>
                  <div>
                    <span className="ow-label">Empty One Water bottles you'll return</span>
                    <Stepper label="empty bottles" value={empties} max={qty} onChange={setEmpties} />
                  </div>
                </div>

                <div>
                  <span className="ow-label">How often?</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SCHEDULES.map((s) => (
                      <button key={s.id} type="button" onClick={() => setSchedule(s.id)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                        style={{ background: schedule === s.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${schedule === s.id ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: schedule === s.id ? '#fff' : 'rgba(150,200,255,0.75)' }}
                        aria-pressed={schedule === s.id}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {schedule !== 'once' && <p className="text-xs ow-muted mt-2">We'll confirm your regular delivery day on WhatsApp. No automatic charges — pay per delivery.</p>}
                </div>

                <dl className="rounded-xl p-4 space-y-2 text-sm" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.18)' }}>
                  <div className="flex justify-between"><dt className="ow-muted">Water ({qty} × {pkr(price)})</dt><dd className="text-white">{pkr(qty * price)}</dd></div>
                  <div className="flex justify-between"><dt className="ow-muted">Refundable deposit ({newBottles} new bottle{newBottles === 1 ? '' : 's'})</dt><dd className="text-white">{pkr(newBottles * deposit)}</dd></div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-2" style={{ borderTop: '1px solid rgba(0,212,255,0.18)' }}><dt className="text-white">First delivery</dt><dd className="ow-cyan">{pkr(qty * price + newBottles * deposit)}</dd></div>
                  {schedule !== 'once' && <p className="text-xs ow-muted">Next deliveries: {pkr(qty * price)} each when you swap your empties.</p>}
                </dl>

                <button onClick={addToCart} className="ow-btn w-full !py-4"><ShoppingCart className="w-5 h-5" /> Add to cart</button>
              </div>
            ) : (
              <div className="ow-card p-6 md:p-8 space-y-4">
                <h2 className="font-heading font-bold text-2xl text-white">Order 19L bottles on WhatsApp</h2>
                <p className="ow-muted">Message us with how many bottles you need and your area — we'll confirm the price and delivery time.</p>
                <OrderBuilder />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          {[
            { icon: Truck, title: freeDelivery ? 'Free delivery' : 'Doorstep delivery', text: `Anywhere in ${settings.service_areas.cities.join(', ')}.` },
            { icon: RefreshCw, title: 'Swap your empties', text: 'Return an empty, pay only for the water.' },
            { icon: ShieldCheck, title: 'Refundable deposit', text: `${pkr(deposit)} per new bottle — returned when you give the bottle back.` },
            { icon: Wallet, title: 'Cash on delivery', text: 'Pay the rider. No advance, no automatic charges.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="ow-card ow-card-hover p-5">
              <Icon className="w-6 h-6 ow-cyan mb-3" />
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm ow-muted">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {product && (
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <SectionHeading eyebrow={<><Calculator className="w-4 h-4" /> Monthly cost calculator</>} title="How much water does your family need?" />
            <Reveal className="ow-card p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                <div>
                  <span className="ow-label flex items-center gap-2"><Users className="w-4 h-4 ow-cyan" /> People at home / office</span>
                  <Stepper label="people" value={people} min={1} max={60} onChange={setPeople} />
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm ow-muted">About <strong className="text-white">{bottlesPerWeek} bottle{bottlesPerWeek > 1 ? 's' : ''} a week</strong></p>
                  <p className="font-heading font-black text-3xl text-white">{pkr(bottlesPerWeek * price * 4.33)}<span className="text-base font-medium ow-muted"> / month</span></p>
                </div>
              </div>
              <p className="text-xs ow-subtle mt-4">Estimate based on ~2.5 litres per person per day for drinking and cooking. Deposit is paid once, only for new bottles.</p>
              <button className="ow-btn-ghost mt-5" onClick={() => { setQty(bottlesPerWeek); setEmpties(0); setSchedule('weekly'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Use {bottlesPerWeek} bottle{bottlesPerWeek > 1 ? 's' : ''} weekly
              </button>
            </Reveal>
            <p className="text-center text-sm ow-muted mt-8">Ordering for an office, school or event? <Link to="/events" className="ow-cyan hover:underline">Get a bulk quote →</Link></p>
          </div>
        </section>
      )}
    </div>
  );
}
