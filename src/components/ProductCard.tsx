import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { settings } = useSiteSettings();
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image, category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group ow-card ow-card-hover flex flex-col overflow-hidden">
      <div className="relative aspect-square p-6 flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 60%, rgba(0,212,255,0.12), rgba(0,0,0,0.2) 70%)' }}>
        <img
          src={product.image}
          alt={`One Water ${product.size} bottle`}
          loading="lazy" decoding="async" width={320} height={320}
          className="relative z-10 max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
        />
        {!product.inStock && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Out of stock</span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2 gap-2">
          <h3 className="font-heading font-bold text-white truncate">{product.name}</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ow-cyan" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            {product.size}
          </span>
        </div>
        <p className="text-sm leading-relaxed mb-4 flex-grow ow-muted">{product.description}</p>
        {product.category === 'dispenser' && (
          <p className="text-xs mb-3 font-medium text-sky-400">
            + {pkr(settings.delivery_info.bottle_deposit)} refundable deposit per new bottle · free when you exchange an empty
          </p>
        )}
        <div className="flex items-center justify-between mt-auto gap-3">
          <span className="font-heading font-black text-xl text-white">{pkr(product.price)}</span>
          <button disabled={!product.inStock} onClick={add} className="ow-btn !px-4 !py-2 text-sm" aria-label={`Add ${product.name} to cart`}>
            {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}
