import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Mountain, Leaf, ChevronRight, Star, Truck } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import heroBg from '@/assets/brand/hero-bg.jpg';

const trustBadges = [
  { icon: Shield, label: 'PSQCA Certified', desc: 'Government approved quality standards' },
  { icon: Mountain, label: 'Himalayan Source', desc: 'Pure glacial spring water' },
  { icon: Leaf, label: 'Eco-Friendly', desc: 'Sustainable packaging & process' },
  { icon: Star, label: 'Premium Quality', desc: 'Tested every batch' },
  { icon: Truck, label: 'Home Delivery', desc: 'Across major cities' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Himalayan mountains" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-background" />
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
            <span className="text-sm font-medium text-primary-foreground">🏔️ Sourced from the Himalayas</span>
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-7xl text-primary-foreground mb-6 leading-tight">
            Pure. Transparent.<br />
            <span className="text-gradient">Pakistani.</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Premium Himalayan mineral water — naturally purified through ancient glaciers, 
            rigorously tested, and delivered fresh to your doorstep.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="water-gradient text-primary-foreground font-semibold text-lg px-8">
              <Link to="/products">Order Now <ChevronRight className="w-5 h-5 ml-1" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              <Link to="/quality">View Lab Reports</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl water-gradient flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <badge.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Our <span className="text-primary">Products</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From pocket-sized 300ml to family-friendly 19L dispensers — pure hydration for every need.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 water-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl text-primary-foreground mb-4">
            🎉 Eid Special — 15% Off All Orders!
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Use code <span className="font-bold bg-primary-foreground/20 px-3 py-1 rounded-md">EID2026</span> at checkout. 
            Limited time offer.
          </p>
          <Button asChild size="lg" variant="secondary" className="font-semibold">
            <Link to="/offers">View All Offers</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
            Need 19L Home Delivery?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Subscribe for weekly or bi-weekly delivery. PKR 250 per refill, 
            PKR 1,000 refundable bottle deposit.
          </p>
          <Button asChild size="lg" className="water-gradient text-primary-foreground font-semibold">
            <Link to="/delivery">Start Subscription <ChevronRight className="w-5 h-5 ml-1" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
