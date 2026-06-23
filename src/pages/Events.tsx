import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Users, Calendar, MapPin, Tag, Heart, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';
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

export default function Events() {
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('');
  const [quote, setQuote] = useState<{ bottles: number; price: number } | null>(null);

  // Inquiry Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [bottleSize, setBottleSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const calculateQuote = () => {
    const g = parseInt(guests) || 0;
    const bottlesPerPerson = eventType === 'wedding' ? 3 : eventType === 'corporate' ? 2 : 2;
    const bottles = g * bottlesPerPerson;
    const pricePerBottle = bottles >= 100 ? 40 : 50;
    setQuote({ bottles, price: bottles * pricePerBottle });
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      setStatusMsg('Name and Phone are required.');
      return;
    }
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, event_date: date, event_location: location,
          bottle_size: bottleSize, quantity, notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ Inquiry submitted successfully! We will contact you soon.');
        setName(''); setPhone(''); setEmail(''); setDate(''); setLocation('');
        setBottleSize(''); setQuantity(''); setNotes('');
      } else {
        setStatusMsg(`❌ Error: ${data.message || 'Failed to submit'}`);
      }
    } catch (err) {
      setStatusMsg('❌ Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 60%)' }} />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Sparkles className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Premium Hydration</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
            Events &{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Bulk Orders
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Premium hydration for weddings, corporate events, and community gatherings. Custom labels available!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Left Column */}
            <div>
              <FadeIn delay={100}>
                <h2 className="font-heading font-bold text-xl text-white mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5" style={{ color: CYAN }} /> Smart Quote Calculator
                </h2>
                <div className="rounded-2xl p-6 space-y-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      <Users className="w-4 h-4 inline mr-1" /> Number of Guests
                    </label>
                    <input
                      type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)}
                      placeholder="e.g. 200"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      <Calendar className="w-4 h-4 inline mr-1" /> Event Type
                    </label>
                    <select
                      value={eventType} onChange={e => setEventType(e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      className="bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300d4ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_auto] bg-[position:right_16px_center]"
                    >
                      <option value="" disabled style={{ background: '#030D1A' }}>Select event type</option>
                      <option value="wedding" style={{ background: '#030D1A' }}>Wedding</option>
                      <option value="corporate" style={{ background: '#030D1A' }}>Corporate Event</option>
                      <option value="community" style={{ background: '#030D1A' }}>Community Gathering</option>
                      <option value="other" style={{ background: '#030D1A' }}>Other</option>
                    </select>
                  </div>

                  <button
                    onClick={calculateQuote}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'; }}
                  >
                    Calculate Quote
                  </button>

                  {quote && (
                    <div className="mt-4 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2"
                      style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      <h3 className="font-heading font-semibold text-white mb-2">Estimated Quote</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: 'rgba(150,200,255,0.7)' }}>Recommended Bottles (500ml)</span>
                        <span className="font-semibold text-white">{quote.bottles}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: 'rgba(150,200,255,0.7)' }}>Estimated Price</span>
                        <span className="font-heading font-bold text-xl" style={{ color: CYAN }}>PKR {quote.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'rgba(150,200,255,0.5)' }}>* Includes bulk discount for orders 100+ bottles</p>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Extras */}
              <FadeIn delay={200}>
                <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <h3 className="font-heading font-bold text-white mb-2 flex items-center gap-2">
                    <Tag className="w-5 h-5" style={{ color: CYAN }} /> Custom Label Printing
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(150,200,255,0.7)' }}>
                    Add your event name, logo, or message on every bottle. Minimum order: 100 bottles.
                  </p>
                  <button className="px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                    style={{ background: 'rgba(0,212,255,0.1)', color: CYAN, border: '1px solid rgba(0,212,255,0.3)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}>
                    Request Custom Labels
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h3 className="font-heading font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" /> Ramadan Charity Donations
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(150,200,255,0.7)' }}>
                    Donate clean water to underprivileged communities this Ramadan. 
                    We match every 10 bottles donated with 5 more from us.
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Inquiry Form */}
            <div>
              <FadeIn delay={150}>
                <h2 className="font-heading font-bold text-xl text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: CYAN }} /> Event Inquiry Form
                </h2>
                <div className="rounded-2xl p-6 space-y-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                  
                  <input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                  <input placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                  <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  
                  <input type="date" placeholder="Event Date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  <input placeholder="Event Location" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
                  
                  <select
                    value={bottleSize} onChange={e => setBottleSize(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    className="bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300d4ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_auto] bg-[position:right_16px_center]"
                  >
                    <option value="" disabled style={{ background: '#030D1A' }}>Bottle Size</option>
                    <option value="300ml" style={{ background: '#030D1A' }}>300ml</option>
                    <option value="500ml" style={{ background: '#030D1A' }}>500ml</option>
                    <option value="1000ml" style={{ background: '#030D1A' }}>1L</option>
                    <option value="1500ml" style={{ background: '#030D1A' }}>1.5L</option>
                  </select>

                  <input type="number" placeholder="Estimated Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} style={inputStyle} />
                  <textarea placeholder="Additional Notes (custom labels, delivery timing, etc.)" value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'none' }} />
                  
                  {statusMsg && (
                    <p className={`text-sm ${statusMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {statusMsg}
                    </p>
                  )}

                  <button
                    onClick={handleSubmit} disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 mt-2"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 20px rgba(0,212,255,0.25)', opacity: loading ? 0.7 : 1 }}
                    onMouseEnter={e => { if(!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.4)'; }}
                    onMouseLeave={e => { if(!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'; }}
                  >
                    {loading ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
