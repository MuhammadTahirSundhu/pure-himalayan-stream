import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, Upload, CreditCard, Truck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const paymentMethods = [
  { id: 'easypaisa', name: 'Easypaisa', account: '0300-1234567', color: 'bg-green-500' },
  { id: 'jazzcash', name: 'JazzCash', account: '0301-7654321', color: 'bg-red-500' },
  { id: 'sadapay', name: 'SadaPay / NayaPay', account: '0302-9876543', color: 'bg-purple-500' },
  { id: 'cod', name: 'Cash on Delivery', account: '', color: 'bg-muted-foreground' },
];

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

      // 1. Upload screenshot if a payment requires one
      if (screenshot) {
        const formData = new FormData();
        formData.append('screenshot', screenshot);

        const uploadRes = await fetch('/api/orders/screenshot', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload screenshot.");
        }
        const uploadData = await uploadRes.json();
        screenshot_url = uploadData.url;
      }

      // 2. Submit final order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ref: ref,
          customer_name: form.name,
          phone: form.phone,
          city: form.city,
          area: form.area,
          street: form.street,
          payment_method: paymentMethod,
          total: total,
          screenshot_url,
          items: items.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: p.price
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to submit order.");
      
      setOrderRef(ref);
      setStep(5);
      clearCart();
    } catch (err) {
      alert("There was an error submitting your order. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step < 5) {
    return (
      <div className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-heading font-bold text-2xl text-foreground mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/products')} className="water-gradient text-primary-foreground">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-8 text-center">Checkout</h1>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? 'water-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{s}</div>
              {s < 5 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Delivery */}
        {step === 1 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Delivery Details
            </h2>
            <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="Area / Locality" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
            <Input placeholder="Street Address *" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            <Button
              className="w-full water-gradient text-primary-foreground font-semibold"
              disabled={!form.name || !form.phone || !form.city || !form.street}
              onClick={() => setStep(2)}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(pm => (
                <button
                  key={pm.id}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === pm.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPaymentMethod(pm.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${pm.color} mb-2`} />
                  <p className="font-semibold text-sm text-foreground">{pm.name}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1 water-gradient text-primary-foreground font-semibold"
                disabled={!paymentMethod}
                onClick={() => setStep(paymentMethod === 'cod' ? 4 : 3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Account Info */}
        {step === 3 && selectedPayment && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-xl">Transfer Payment</h2>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Send <strong>PKR {Math.round(total).toLocaleString()}</strong> to:</p>
              <p className="font-heading font-bold text-2xl text-primary">{selectedPayment.account}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedPayment.name} — One Water</p>
            </div>
            <p className="text-sm text-muted-foreground">After transferring, proceed to upload your payment screenshot.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1 water-gradient text-primary-foreground font-semibold" onClick={() => setStep(4)}>
                I've Transferred — Upload Screenshot
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Screenshot Upload */}
        {step === 4 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {paymentMethod === 'cod' ? 'Confirm Order' : 'Upload Payment Screenshot'}
            </h2>

            {paymentMethod !== 'cod' && (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setScreenshot(e.target.files?.[0] || null)}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {screenshot ? screenshot.name : 'Click to upload payment screenshot'}
                  </p>
                </label>
              </div>
            )}

            {/* Order Summary */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <h3 className="font-semibold text-sm">Order Summary</h3>
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>PKR {item.price * item.quantity}</span>
                </div>
              ))}
              {promoCode && <p className="text-xs text-accent">Promo: {promoCode} (-{discount}%)</p>}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>PKR {Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(paymentMethod === 'cod' ? 2 : 3)}>Back</Button>
              <Button
                className="flex-1 water-gradient text-primary-foreground font-semibold"
                disabled={(paymentMethod !== 'cod' && !screenshot) || isSubmitting}
                onClick={handleSubmitOrder}
              >
                {isSubmitting ? 'Submitting...' : (paymentMethod === 'cod' ? 'Place Order (COD)' : 'Submit Order')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-4">Thank you for choosing One Water.</p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm text-muted-foreground">Order Reference</p>
              <p className="font-heading font-bold text-2xl text-primary">{orderRef}</p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/923001234567?text=Hi! I just placed order ${orderRef}. Please confirm.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-accent text-accent-foreground font-semibold">
                  Confirm on WhatsApp
                </Button>
              </a>
              <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
