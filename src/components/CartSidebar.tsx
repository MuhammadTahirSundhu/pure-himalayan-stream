import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { estimateCart, pkr } from '@/lib/pricing';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, promo, applyPromo, removePromo } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, setIsOpen]);

  const est = estimateCart(items, settings.delivery_info, promo?.discount ?? 0);
  const belowMin = promo && est.subtotal < promo.minOrder;

  const handleApply = async () => {
    if (!promoInput.trim()) return;
    setApplying(true);
    const err = await applyPromo(promoInput.trim());
    setPromoError(err ?? '');
    if (!err) setPromoInput('');
    setApplying(false);
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />
      <aside
        role="dialog" aria-modal="true" aria-label="Your cart"
        className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#04121f', borderLeft: '1px solid rgba(0,212,255,0.18)' }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(0,212,255,0.12)' }}>
          <h2 className="font-heading font-semibold text-lg text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 ow-cyan" /> Your Cart</h2>
          <button className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)} aria-label="Close cart"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag className="w-12 h-12 ow-subtle" />
              <p className="ow-muted">Your cart is empty</p>
              <button className="ow-btn-ghost !py-2" onClick={() => { setIsOpen(false); navigate('/products'); }}>Browse products</button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => {
                const newBottles = item.category === 'dispenser' ? Math.min(item.quantity, item.newBottles ?? item.quantity) : 0;
                return (
                  <li key={item.id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <img src={item.image} alt="" className="w-16 h-16 object-contain rounded" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-white truncate">{item.name}</h3>
                      <p className="text-xs ow-subtle">{pkr(item.price)} each</p>
                      {newBottles > 0 && <p className="text-xs text-sky-400">+ {pkr(newBottles * settings.delivery_info.bottle_deposit)} deposit ({newBottles} new bottle{newBottles > 1 ? 's' : ''})</p>}
                      <p className="font-semibold text-sm text-white mt-1">{pkr(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button className="p-1 text-white/40 hover:text-red-400" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 className="w-4 h-4" /></button>
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-white bg-white/10 hover:bg-white/20" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-semibold text-white w-5 text-center tabular-nums">{item.quantity}</span>
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-white bg-white/10 hover:bg-white/20" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(0,212,255,0.12)' }}>
            {promo ? (
              <div className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="text-emerald-300 flex items-center gap-1.5"><Tag className="w-4 h-4" /> {promo.code} — {promo.discount}% off water</span>
                <button className="text-xs text-white/60 hover:text-white" onClick={removePromo}>Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className="ow-input !py-2.5" placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApply()} aria-label="Promo code" />
                <button className="ow-btn-ghost !py-2.5 !px-4 text-sm" onClick={handleApply} disabled={applying}>{applying ? '…' : 'Apply'}</button>
              </div>
            )}
            {promoError && <p className="ow-error">{promoError}</p>}
            {belowMin && <p className="text-xs text-amber-300">{promo!.code} needs a minimum water order of {pkr(promo!.minOrder)}.</p>}

            <dl className="space-y-1 text-sm">
              <div className="flex justify-between ow-muted"><dt>Water</dt><dd>{pkr(est.subtotal)}</dd></div>
              {est.discount > 0 && !belowMin && <div className="flex justify-between text-emerald-300"><dt>Discount</dt><dd>−{pkr(est.discount)}</dd></div>}
              {est.deposit > 0 && <div className="flex justify-between ow-muted"><dt>Refundable bottle deposit</dt><dd>{pkr(est.deposit)}</dd></div>}
              <div className="flex justify-between ow-muted"><dt>Delivery</dt><dd>{est.deliveryFee ? pkr(est.deliveryFee) : 'Free'}</dd></div>
              <div className="flex justify-between font-heading font-bold text-lg text-white pt-1"><dt>Estimated total</dt><dd>{pkr(belowMin ? est.total + est.discount : est.total)}</dd></div>
            </dl>

            <button className="ow-btn w-full" onClick={() => { setIsOpen(false); navigate('/checkout'); }}>Proceed to Checkout</button>
            <p className="text-center text-xs ow-subtle">Cash on delivery available · Delivering in {settings.service_areas.cities.join(', ')}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
