import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Tag, Clock, Gift, Percent } from 'lucide-react';
import bottle500 from '@/assets/brand/bottle-500ml.png';
import bottle1500 from '@/assets/brand/bottle-1500ml.png';

const offers = [
  {
    id: 'eid-bundle',
    title: 'Eid Family Bundle',
    description: '12x 1.5L bottles + 6x 500ml bottles. Perfect for Eid gatherings.',
    originalPrice: 1500,
    salePrice: 1275,
    promoCode: 'EID2026',
    discount: '15% OFF',
    image: bottle1500,
    badge: '🎉 Eid Special',
  },
  {
    id: 'ramadan-pack',
    title: 'Ramadan Iftar Pack',
    description: '24x 500ml bottles for Iftar gatherings and Suhoor hydration.',
    originalPrice: 1200,
    salePrice: 1080,
    promoCode: 'RAMADAN10',
    discount: '10% OFF',
    image: bottle500,
    badge: '🌙 Ramadan',
  },
  {
    id: 'welcome-offer',
    title: 'New Customer Welcome',
    description: 'First-time order? Get 5% off on any order. No minimum!',
    originalPrice: 0,
    salePrice: 0,
    promoCode: 'WELCOME5',
    discount: '5% OFF',
    image: bottle500,
    badge: '🎁 Welcome',
  },
  {
    id: 'bulk-20',
    title: 'Bulk Order Discount',
    description: 'Order 50+ bottles of any size and get 20% off the entire order.',
    originalPrice: 0,
    salePrice: 0,
    promoCode: 'ONEWATER20',
    discount: '20% OFF',
    image: bottle1500,
    badge: '📦 Bulk',
  },
];

export default function Offers() {
  const { addItem } = useCart();

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Special <span className="text-primary">Offers</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Exclusive deals on premium Himalayan water. Use promo codes at checkout!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {offers.map(offer => (
            <div key={offer.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {offer.badge}
                  </span>
                  <span className="text-sm font-bold text-accent flex items-center gap-1">
                    <Percent className="w-4 h-4" /> {offer.discount}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{offer.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>

                {offer.originalPrice > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-muted-foreground line-through text-sm">PKR {offer.originalPrice}</span>
                    <span className="font-heading font-bold text-lg text-foreground">PKR {offer.salePrice}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mb-4">
                  <Tag className="w-4 h-4 text-primary" />
                  <code className="font-mono font-bold text-sm text-primary">{offer.promoCode}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
