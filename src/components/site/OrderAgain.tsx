import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadLastOrder, type LastOrder } from '@/lib/lastOrder';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';

/** "Order again" for returning visitors on this device. Repeat 19L orders assume empties are swapped. */
export default function OrderAgain({ className = '' }: { className?: string }) {
  const [last, setLast] = useState<LastOrder | null>(null);
  const { data: products = [] } = useProducts();
  const { setItem, setIsOpen, setSchedule } = useCart();
  useEffect(() => setLast(loadLastOrder()), []);

  const lines = (last?.items ?? []).map((it) => ({ it, p: products.find((x) => x.id === it.id && x.inStock) })).filter((l) => l.p);
  if (!last || !lines.length) return null;

  const reorder = () => {
    for (const { it, p } of lines) {
      setItem({ id: p!.id, name: p!.name, size: p!.size, price: p!.price, image: p!.image, category: p!.category, quantity: it.quantity, newBottles: p!.category === 'dispenser' ? 0 : undefined });
    }
    if (last.schedule && last.schedule !== 'once') setSchedule(last.schedule as 'weekly' | 'biweekly' | 'monthly');
    setIsOpen(true);
  };

  return (
    <button onClick={reorder} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-colors hover:bg-white/10 ${className}`}
      style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
      <RotateCcw className="w-4 h-4 text-emerald-300" />
      Order again: {lines.map(({ it, p }) => `${it.quantity} × ${p!.size}`).join(', ')}
    </button>
  );
}
