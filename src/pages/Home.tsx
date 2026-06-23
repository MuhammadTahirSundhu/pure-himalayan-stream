import { Link } from 'react-router-dom';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import TrustBadgesStrip from '@/components/TrustBadgesStrip';
import heroBg from '@/assets/brand/hero-bg.jpg';

export default function Home() {
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { data: products, isLoading } = useProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Pure Himalayan mountain source of OneWater Pakistan mineral water" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-background" />

        {/* Animated water ripples */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <span className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-2 border-primary-foreground/30 animate-ripple" />
          <span className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full border-2 border-primary-foreground/20 animate-ripple" style={{ animationDelay: '0.7s' }} />
          <span className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full border-2 border-primary-foreground/20 animate-ripple" style={{ animationDelay: '1.4s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <Reveal>
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
              <span className="text-sm font-medium text-primary-foreground">🏔️ Sourced from the Himalayas</span>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-7xl text-primary-foreground mb-6 leading-tight">
              Pure. Transparent.<br />
              <span className="text-gradient">Pakistani.</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Premium Himalayan mineral water — naturally purified through ancient glaciers,
              rigorously tested, and delivered fresh to your doorstep.
            </p>
          </Reveal>
          <Reveal delay={450}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="water-gradient text-primary-foreground font-semibold text-lg px-8 shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5 transition-all">
                <Link to="/products">Order Now <ChevronRight className="w-5 h-5 ml-1" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                <Link to="/quality">View Lab Reports</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust Badges Strip — links to Quality certifications */}
      <TrustBadgesStrip />

      {/* Featured Products — Auto-play carousel */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Our <span className="text-primary">Products</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From pocket-sized 300ml to family-friendly 19L dispensers — pure hydration for every need.
            </p>
          </Reveal>

          <Reveal>
            <Carousel
              opts={{ align: 'start', loop: true }}
              plugins={[autoplay.current]}
              className="max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <CarouselItem key={i} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-muted/60" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="flex justify-between pt-1">
                          <div className="h-5 bg-muted rounded w-16" />
                          <div className="h-8 bg-muted rounded-md w-24" />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
                {products?.map(p => (
                  <CarouselItem key={p.id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard product={p} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Promo Banner */}
      <Reveal as="section" className="py-16 water-gradient relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer pointer-events-none" aria-hidden />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="font-heading font-bold text-3xl text-primary-foreground mb-4">
            🎉 Eid Special — 15% Off All Orders!
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Use code <span className="font-bold bg-primary-foreground/20 px-3 py-1 rounded-md">EID2026</span> at checkout.
            Limited time offer.
          </p>
          <Button asChild size="lg" variant="secondary" className="font-semibold hover:-translate-y-0.5 transition-transform">
            <Link to="/offers">View All Offers</Link>
          </Button>
        </div>
      </Reveal>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Reveal>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
              Need 19L Home Delivery?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Subscribe for weekly or bi-weekly delivery. PKR 250 per refill,
              PKR 1,000 refundable bottle deposit.
            </p>
            <Button asChild size="lg" className="water-gradient text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all">
              <Link to="/delivery">Start Subscription <ChevronRight className="w-5 h-5 ml-1" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

