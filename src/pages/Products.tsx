import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Package, Truck, ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import ProductCard from '@/components/ProductCard';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import OrderBuilder from '@/components/site/OrderBuilder';
import TrustRow from '@/components/site/TrustRow';
import Seo, { SITE_URL } from '@/components/site/Seo';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';

function ProductSkeleton() {
  return (
    <div className="ow-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded w-2/3 bg-white/10" />
        <div className="h-3 rounded w-full bg-white/5" />
        <div className="h-8 rounded w-1/3 bg-cyan-400/10" />
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const { settings } = useSiteSettings();
  const count = products?.length ?? 5;

  const productSchema = (products ?? []).map((p) => ({
    '@type': 'Product',
    name: p.name,
    description: p.description,
    brand: { '@type': 'Brand', name: 'One Water' },
    image: p.image.startsWith('http') ? p.image : `${SITE_URL}${p.image}`,
    offers: {
      '@type': 'Offer', price: p.price, priceCurrency: 'PKR', url: `${SITE_URL}/products`,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      areaServed: settings.service_areas.cities.join(', '),
    },
  }));

  return (
    <div className="ow-page">
      <Seo
        title="Mineral Water Bottles & 19L Prices | One Water Gujranwala"
        description="Order One Water purified mineral water in Gujranwala. See current bottle and 19L prices, add to cart and pay cash on delivery."
        path="/products"
        jsonLd={productSchema}
      />
      <PageHero
        eyebrow={<><Package className="w-4 h-4" /> Our Products</>}
        title={<>Pure water, <span className="ow-gradient-text">honest prices</span></>}
        subtitle="10-stage purified, lab-tested drinking water — delivered across Gujranwala. Pay cash on delivery."
      >
        <TrustRow compact className="justify-center mt-6" />
      </PageHero>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="max-w-md mx-auto text-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="font-heading font-semibold text-lg text-white">We couldn't load our products</h2>
              <p className="text-sm ow-muted">Our server may be waking up. Try again, or order directly on WhatsApp.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => refetch()} className="ow-btn-ghost"><RefreshCw className="w-4 h-4" /> Try again</button>
                <a href={whatsappLink(settings.contact_info.whatsapp, 'Hi One Water, I would like to order water.')} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp"><WhatsAppIcon /> WhatsApp</a>
              </div>
            </div>
          ) : (
            <div className={`grid gap-5 mx-auto ${count <= 2 ? 'max-w-2xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'}`}>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
              {products?.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <Link to="/delivery" className="group mt-10 max-w-3xl mx-auto ow-card ow-card-hover p-5 flex items-center gap-4">
            <Truck className="w-8 h-8 ow-cyan shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-white">Need a 19L dispenser bottle for home or office?</p>
              <p className="text-sm ow-muted">Weekly or one-time delivery — exchange your empty and pay only for the water.</p>
            </div>
            <ArrowRight className="w-5 h-5 ow-cyan transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow="Prefer WhatsApp?" title="Build your order, send it in one tap" subtitle="Pick a product and quantity — we'll confirm the price and delivery time on WhatsApp." />
          <OrderBuilder />
        </div>
      </section>
    </div>
  );
}
