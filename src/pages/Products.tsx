import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { AlertCircle, RefreshCw, Droplets, Package } from 'lucide-react';

const CYAN = '#00d4ff';

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}>
      <div className="aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-5 rounded-full w-12" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 rounded w-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-8 rounded w-24" style={{ background: 'rgba(0,212,255,0.1)' }} />
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, isLoading, error, refetch } = useProducts();

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Hero strip */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 58,15 58,37 30,51 2,37 2,15" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Package className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Premium Selection</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
            Our{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Products</span>
          </h1>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Premium Himalayan mineral water in five sizes — from compact 300ml to the 19L home dispenser.
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="font-heading font-semibold text-lg text-white">Could not load products</h2>
              <p className="text-sm" style={{ color: 'rgba(150,200,255,0.6)' }}>There was a problem connecting to the server.</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {isLoading && Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)}
            {products?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
