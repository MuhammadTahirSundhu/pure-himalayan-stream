import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { Truck, RefreshCw, DollarSign, Package } from 'lucide-react';
import bottle19l from '@/assets/brand/bottle-19l.png';

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
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            19L Home <span className="text-primary">Delivery</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get fresh Himalayan mineral water delivered to your home or office on a schedule that works for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="flex justify-center">
            <img src={bottle19l} alt="19L Bottle" className="max-h-96 object-contain animate-float" />
          </div>

          <div className="space-y-6">
            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold text-foreground">PKR {refillPrice}</p>
                <p className="text-sm text-muted-foreground">Per Refill</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Package className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold text-foreground">PKR {deposit}</p>
                <p className="text-sm text-muted-foreground">Refundable Deposit</p>
                <p className="text-xs text-accent mt-1">First order only</p>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Delivery Schedule</label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empty bottles */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Empty Bottles Returning</label>
              <Input
                type="number"
                min="0"
                value={emptyBottles}
                onChange={e => setEmptyBottles(e.target.value)}
                placeholder="Number of empty bottles"
              />
            </div>

            {/* First order toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFirstOrder}
                onChange={e => setIsFirstOrder(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">This is my first order (includes bottle deposit)</span>
            </label>

            {/* Summary */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refill Cost</span>
                <span className="font-medium">PKR {refillPrice}</span>
              </div>
              {isFirstOrder && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bottle Deposit (refundable)</span>
                  <span className="font-medium">PKR {deposit}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-heading font-semibold">
                <span>Total</span>
                <span>PKR {refillPrice + (isFirstOrder ? deposit : 0)}</span>
              </div>
            </div>

            <Button className="w-full water-gradient text-primary-foreground font-semibold" onClick={handleOrder}>
              <Truck className="w-4 h-4 mr-2" /> Add to Cart
            </Button>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <RefreshCw className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Auto-Refill</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Truck className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Free Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
