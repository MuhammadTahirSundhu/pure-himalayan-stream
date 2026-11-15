import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Percent, Clock, Check, Copy } from 'lucide-react';
import { useOffers } from '@/hooks/useOffers';
import { useCart } from '@/contexts/CartContext';
import { pkr } from '@/lib/pricing';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';

export default function Offers() {
  const { data: offers = [], isLoading, error } = useOffers();
  const { applyPromo, promo } = useCart();
  const [msg, setMsg] = useState<Record<string, string>>({});

  const apply = async (code: string) => {
    const err = await applyPromo(code);
    setMsg((m) => ({ ...m, [code]: err ?? 'applied' }));
  };

  return (
    <div className="ow-page">
      <Seo
        title="Water Delivery Offers & Promo Codes | One Water Gujranwala"
        description="Current One Water promo codes and offers for mineral water delivery in Gujranwala. Apply a code to your cart in one tap."
        path="/offers"
      />
      <PageHero
        eyebrow={<><Tag className="w-4 h-4" /> Current offers</>}
        title={<>Save on <span className="ow-gradient-text">every refill</span></>}
        subtitle="Tap “Apply to my cart” and the discount is added at checkout. Discounts apply to water, not the refundable bottle deposit."
      />

      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-6">{[1, 2].map((i) => <div key={i} className="h-72 ow-card animate-pulse" />)}</div>
          ) : error || !offers.length ? (
            <div className="ow-card p-10 text-center max-w-xl mx-auto">
              <Tag className="w-10 h-10 ow-cyan mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl text-white mb-2">No offers running right now</h2>
              <p className="ow-muted mb-5">Check back soon — or order now at our regular prices with free delivery in Gujranwala.</p>
              <Link to="/products" className="ow-btn">See products</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {offers.map((offer, i) => {
                const state = msg[offer.promo_code];
                const isApplied = promo?.code === offer.promo_code;
                return (
                  <Reveal key={offer.id} delay={i * 100}>
                    <article className="group ow-card ow-card-hover h-full p-6 flex flex-col relative overflow-hidden">
                      <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
                      <div className="flex items-start justify-between mb-4 relative">
                        <div className="space-y-2">
                          {offer.badge_text && <span className="inline-block text-xs px-3 py-1 rounded-full font-medium ow-cyan" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>{offer.badge_text}</span>}
                          <h2 className="font-heading font-bold text-xl text-white">{offer.title}</h2>
                        </div>
                        {offer.image_url && <img src={offer.image_url} alt={`${offer.title} — One Water`} loading="lazy" className="w-16 h-16 object-contain shrink-0 ml-4 transition-transform group-hover:scale-110" />}
                      </div>
                      <p className="text-sm leading-relaxed mb-6 flex-grow ow-muted">{offer.description}</p>
                      <div className="space-y-3 relative">
                        <div className="flex items-center justify-between">
                          {offer.original_price > 0 ? (
                            <span className="flex items-center gap-3">
                              <s className="text-sm ow-subtle">{pkr(offer.original_price)}</s>
                              <span className="font-heading font-bold text-2xl text-white">{pkr(offer.sale_price)}</span>
                            </span>
                          ) : <span className="text-sm ow-muted">Discount applied at checkout</span>}
                          <span className="text-sm font-bold flex items-center gap-1 ow-cyan"><Percent className="w-4 h-4" /> {offer.discount_text}</span>
                        </div>
                        {(offer.expires_at || offer.min_order_amount) && (
                          <p className="text-xs ow-subtle flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {offer.expires_at && `Valid until ${new Date(offer.expires_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                            {offer.expires_at && offer.min_order_amount ? ' · ' : ''}
                            {offer.min_order_amount ? `Min. order ${pkr(offer.min_order_amount)}` : ''}
                          </p>
                        )}
                        {offer.promo_code && (
                          <div className="flex items-center gap-2">
                            <code className="flex-1 font-mono font-bold tracking-wider ow-cyan px-3 py-2.5 rounded-xl border border-dashed" style={{ borderColor: 'rgba(0,212,255,0.35)', background: 'rgba(0,0,0,0.2)' }}>
                              {offer.promo_code}
                            </code>
                            <button className="ow-btn !py-2.5 !px-4 text-sm" onClick={() => apply(offer.promo_code)} disabled={isApplied}>
                              {isApplied ? <><Check className="w-4 h-4" /> Applied</> : <><Copy className="w-4 h-4" /> Apply to my cart</>}
                            </button>
                          </div>
                        )}
                        {state && state !== 'applied' && <p className="ow-error">{state}</p>}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
