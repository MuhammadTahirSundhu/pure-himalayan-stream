import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

export default function Products() {
  const { data: products, isLoading, error } = useProducts();
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Our <span className="text-primary">Products</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Premium Himalayan mineral water available in five sizes — from compact 300ml to our 19L home dispenser.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {isLoading && <p>Loading products...</p>}
          {error && <p>Failed to load products.</p>}
          {products?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
