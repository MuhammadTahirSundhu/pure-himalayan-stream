import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 ripple-surface">
      <div className="relative aspect-square bg-gradient-to-b from-water-ice/40 to-background p-6 flex items-center justify-center overflow-hidden">
        {/* Decorative ripple rings */}
        <span className="absolute inset-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 opacity-0 group-hover:opacity-100 group-hover:animate-ripple pointer-events-none" />
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="relative max-h-full max-w-full object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-foreground">{product.name}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {product.size}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        {product.id === '19l' && (
          <p className="text-xs text-accent mb-2">+ PKR 1,000 refundable deposit (first order)</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg text-foreground">
            PKR {product.price}
          </span>
          <Button
            size="sm"
            className="water-gradient text-primary-foreground"
            disabled={!product.inStock}
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
          </Button>
        </div>
      </div>
    </div>
  );
}
