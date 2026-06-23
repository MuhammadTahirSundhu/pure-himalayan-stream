import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ProductSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted/60" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-5 bg-muted rounded-full w-12" />
        </div>
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-8 bg-muted rounded-md w-24" />
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, isLoading, error, refetch } = useProducts();

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

        {error && (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-foreground">Could not load products</h2>
            <p className="text-sm text-muted-foreground">There was a problem connecting to the server. Please try again.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
          {products?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

