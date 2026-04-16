import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, discount, promoCode, applyPromo } = useCart();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (applyPromo(promoInput)) {
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Your Cart
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mb-4" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.size}</p>
                    {item.deposit && <p className="text-xs text-primary">+ PKR {item.deposit} deposit</p>}
                    <p className="font-semibold text-sm mt-1">PKR {item.price * item.quantity}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 self-start" onClick={() => removeItem(item.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Promo code"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleApplyPromo}>Apply</Button>
            </div>
            {promoError && <p className="text-xs text-destructive">{promoError}</p>}
            {promoCode && <p className="text-xs text-accent">✓ {promoCode} applied — {discount}% off</p>}

            <div className="flex justify-between font-heading font-semibold text-lg">
              <span>Total</span>
              <span>PKR {Math.round(total).toLocaleString()}</span>
            </div>

            <Button
              className="w-full water-gradient text-primary-foreground font-semibold"
              onClick={() => { setIsOpen(false); navigate('/checkout'); }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
