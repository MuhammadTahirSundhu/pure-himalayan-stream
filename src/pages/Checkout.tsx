import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, Upload, CreditCard, Truck, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';
const CYAN = '#00d4ff';

const paymentMethods = [
  { id: 'easypaisa', name: 'Easypaisa', account: '0300-1234567', color: 'bg-emerald-500' },
  { id: 'jazzcash', name: 'JazzCash', account: '0301-7654321', color: 'bg-red-500' },
  { id: 'sadapay', name: 'SadaPay / NayaPay', account: '0302-9876543', color: 'bg-violet-500' },
  { id: 'cod', name: 'Cash on Delivery', account: '', color: 'bg-slate-400' },
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', outline: 'none',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
  color: '#fff', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function Checkout() {
  const { items, total, discount, promoCode, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: '', area: '', street: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [orderRef, setOrderRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod);

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    const ref = `OW-${Date.now().toString(36).toUpperCase()}`;
    
    try {
      let screenshot_url = null;
      if (screenshot) {
        const formData = new FormData();
        formData.append('screenshot', screenshot);
        const uploadRes = await fetch(`${API_URL}/api/orders/screenshot`, { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error("Failed to upload screenshot.");
        const uploadData = await uploadRes.json();
        screenshot_url = uploadData.url;
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ref: ref, customer_name: form.name, phone: form.phone,
          city: form.city, area: form.area, street: form.street,
          payment_method: paymentMethod, total: total, screenshot_url,
          items: items.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, price: p.price }))
        })
      });

      if (!response.ok) throw new Error("Failed to submit order.");
      
      setOrderRef(ref);
      setStep(5);
      clearCart();
    } catch (err) {
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030D1A' }}>
        <div className="text-center">
          <h1 className="font-heading font-bold text-3xl text-white mb-6">Your cart is empty</h1>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Background Orbs */}
      <div className="fixed top-20 left-10 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 60%)' }} />

      <div className="py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <FadeIn>
            <h1 className="font-heading font-black text-4xl text-center text-white mb-10">Checkout</h1>
          </FadeIn>

          {/* Steps indicator */}
          <FadeIn delay={100} className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s ? 'text-white' : 'text-slate-500'
                }`}
                style={{
                  background: step >= s ? 'linear-gradient(135deg, #00d4ff, #0284c7)' : 'rgba(255,255,255,0.05)',
                  boxShadow: step >= s ? '0 0 15px rgba(0,212,255,0.4)' : 'none',
                }}
                >
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 5 && <div className={`w-10 h-0.5 transition-colors duration-300`} style={{ background: step > s ? CYAN : 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </FadeIn>

          <FadeIn delay={200}>
            {/* Step 1: Delivery */}
            {step === 1 && (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2 mb-4">
                  <User className="w-5 h-5" style={{ color: CYAN }} /> Delivery Details
                </h2>
                
                {[
                  { key: 'name', placeholder: 'Full Name *' },
                  { key: 'phone', placeholder: 'Phone Number *' },
                  { key: 'city', placeholder: 'City *' },
                  { key: 'area', placeholder: 'Area / Locality' },
                  { key: 'street', placeholder: 'Street Address *' }
                ].map(f => (
                  <input
                    key={f.key} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                ))}
                
                <button
                  className="w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all duration-300"
                  disabled={!form.name || !form.phone || !form.city || !form.street}
                  onClick={() => setStep(2)}
                  style={{
                    background: (!form.name || !form.phone || !form.city || !form.street) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00d4ff, #0284c7)',
                    boxShadow: (!form.name || !form.phone || !form.city || !form.street) ? 'none' : '0 0 20px rgba(0,212,255,0.3)',
                    opacity: (!form.name || !form.phone || !form.city || !form.street) ? 0.5 : 1
                  }}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5" style={{ color: CYAN }} /> Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      className="p-4 rounded-xl border-2 text-left transition-all duration-300"
                      style={{
                        borderColor: paymentMethod === pm.id ? CYAN : 'rgba(255,255,255,0.1)',
                        background: paymentMethod === pm.id ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)'
                      }}
                      onClick={() => setPaymentMethod(pm.id)}
                    >
                      <div className={`w-3 h-3 rounded-full ${pm.color} mb-2 shadow-lg`} />
                      <p className="font-semibold text-sm text-white">{pm.name}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 rounded-xl text-white font-medium" style={{ background: 'rgba(255,255,255,0.05)' }}>Back</button>
                  <button
                    className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                    disabled={!paymentMethod}
                    onClick={() => setStep(paymentMethod === 'cod' ? 4 : 3)}
                    style={{
                      background: !paymentMethod ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00d4ff, #0284c7)',
                      boxShadow: !paymentMethod ? 'none' : '0 0 20px rgba(0,212,255,0.3)',
                      opacity: !paymentMethod ? 0.5 : 1
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Account Info */}
            {step === 3 && selectedPayment && (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                <h2 className="font-heading font-bold text-xl text-white mb-2">Transfer Payment</h2>
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <p className="text-sm mb-1" style={{ color: 'rgba(150,200,255,0.7)' }}>Send <strong className="text-white">PKR {Math.round(total).toLocaleString()}</strong> to:</p>
                  <p className="font-heading font-black text-3xl" style={{ color: CYAN, letterSpacing: '2px' }}>{selectedPayment.account}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(150,200,255,0.7)' }}>{selectedPayment.name} — One Water</p>
                </div>
                <p className="text-sm" style={{ color: 'rgba(150,200,255,0.7)' }}>After transferring, proceed to upload your payment screenshot.</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="px-6 py-3.5 rounded-xl text-white font-medium" style={{ background: 'rgba(255,255,255,0.05)' }}>Back</button>
                  <button
                    className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                    onClick={() => setStep(4)}
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
                  >
                    I've Transferred <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Screenshot & Summary */}
            {step === 4 && (
              <div className="rounded-2xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)' }}>
                <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" style={{ color: CYAN }} />
                  {paymentMethod === 'cod' ? 'Confirm Order' : 'Upload Payment Screenshot'}
                </h2>

                {paymentMethod !== 'cod' && (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
                    style={{ borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.02)' }}>
                    <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} className="hidden" id="screenshot-upload" />
                    <label htmlFor="screenshot-upload" className="cursor-pointer block">
                      <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: CYAN }} />
                      <p className="text-sm font-medium" style={{ color: screenshot ? '#fff' : 'rgba(150,200,255,0.7)' }}>
                        {screenshot ? screenshot.name : 'Click to upload payment screenshot'}
                      </p>
                    </label>
                  </div>
                )}

                <div className="p-5 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm text-white mb-2">Order Summary</h3>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-white">
                      <span style={{ color: 'rgba(150,200,255,0.8)' }}>{item.name} <span style={{ color: CYAN }}>x{item.quantity}</span></span>
                      <span>PKR {item.price * item.quantity}</span>
                    </div>
                  ))}
                  {promoCode && <p className="text-xs" style={{ color: '#10b981' }}>Promo: {promoCode} (-{discount}%)</p>}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg text-white" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span>Total</span>
                    <span style={{ color: CYAN }}>PKR {Math.round(total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(paymentMethod === 'cod' ? 2 : 3)} className="px-6 py-3.5 rounded-xl text-white font-medium" style={{ background: 'rgba(255,255,255,0.05)' }}>Back</button>
                  <button
                    className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                    disabled={(paymentMethod !== 'cod' && !screenshot) || isSubmitting}
                    onClick={handleSubmitOrder}
                    style={{
                      background: ((paymentMethod !== 'cod' && !screenshot) || isSubmitting) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00d4ff, #0284c7)',
                      boxShadow: ((paymentMethod !== 'cod' && !screenshot) || isSubmitting) ? 'none' : '0 0 20px rgba(0,212,255,0.3)',
                      opacity: ((paymentMethod !== 'cod' && !screenshot) || isSubmitting) ? 0.5 : 1
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : (paymentMethod === 'cod' ? 'Place Order (COD)' : 'Submit Order')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-500"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.2)', backdropFilter: 'blur(12px)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
                  <CheckCircle className="w-10 h-10" style={{ color: CYAN }} />
                </div>
                <h2 className="font-heading font-black text-3xl text-white mb-2">Order Placed!</h2>
                <p className="mb-6" style={{ color: 'rgba(150,200,255,0.7)' }}>Thank you for choosing One Water.</p>
                
                <div className="p-5 rounded-xl mb-6" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <p className="text-sm mb-1" style={{ color: 'rgba(150,200,255,0.7)' }}>Order Reference</p>
                  <p className="font-heading font-bold text-2xl tracking-widest" style={{ color: CYAN }}>{orderRef}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <a href={`https://wa.me/923203133140?text=Hi! I just placed order ${orderRef}. Please confirm.`} target="_blank" rel="noopener noreferrer">
                    <button className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}>
                      Confirm on WhatsApp
                    </button>
                  </a>
                  <button onClick={() => navigate('/')} className="py-3.5 rounded-xl font-medium text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
