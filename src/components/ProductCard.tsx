import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

    <div
      className="group rounded-2xl flex flex-col overflow-hidden transition-all duration-400"
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
      <div className="relative aspect-square p-6 flex items-center justify-center overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        {/* Glow behind image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
        
        <img
          src={product.image}
          alt={`${product.name} - Premium Mineral Water`}
          loading="lazy"
          className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-white truncate pr-2">{product.name}</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
            {product.size}
          </span>
        </div>
        <p className="text-sm leading-relaxed mb-4 flex-grow" style={{ color: 'rgba(150,200,255,0.7)' }}>
          {product.description}
        </p>
        
        {product.id === '19l' && (
          <p className="text-xs mb-3 font-medium" style={{ color: '#0ea5e9' }}>+ PKR 1,000 refundable deposit (first order)</p>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-heading font-black text-xl text-white tracking-wide">
            PKR {product.price}
          </span>
          <button
            disabled={!product.inStock}
            className="px-4 py-2 rounded-lg font-bold text-white transition-all duration-300 text-sm"
            style={{
              background: product.inStock ? 'linear-gradient(135deg, #00d4ff, #0284c7)' : 'rgba(255,255,255,0.1)',
              boxShadow: product.inStock ? '0 0 15px rgba(0,212,255,0.3)' : 'none',
              opacity: product.inStock ? 1 : 0.5,
              cursor: product.inStock ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={e => { if(product.inStock) { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(0,212,255,0.5)'; } }}
            onMouseLeave={e => { if(product.inStock) { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(0,212,255,0.3)'; } }}
            onClick={() => addItem({
              id: product.id,
              name: product.name,
              size: product.size,
              price: product.price,
              image: product.image,
              deposit: product.id === '19l' ? 1000 : undefined,
            })}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
}
