import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import bottle500 from '@/assets/brand/bottle-500ml.png';
import bottle1500 from '@/assets/brand/bottle-1500ml.png';
import bottle19l from '@/assets/brand/bottle-19l.png';

export interface Offer {
  id: string;
  title: string;
  description: string;
  original_price: number;
  sale_price: number;
  promo_code: string;
  discount_text: string;
  image_url: string | null;
  badge_text: string;
  expires_at: string | null;
  min_order_amount: number | null;
}

// Seeded offers point at /assets/brand/*.png, which only exist as bundled imports.
const SEED_IMAGES: Record<string, string> = {
  '/assets/brand/bottle-500ml.png': bottle500,
  '/assets/brand/bottle-1500ml.png': bottle1500,
  '/assets/brand/bottle-19l.png': bottle19l,
};

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Offer[]> => {
      const rows = await api<Offer[]>('/api/offers');
      return rows.map((o) => ({
        ...o,
        original_price: Number(o.original_price) || 0,
        sale_price: Number(o.sale_price) || 0,
        min_order_amount: o.min_order_amount === null ? null : Number(o.min_order_amount),
        image_url: (o.image_url && SEED_IMAGES[o.image_url]) || o.image_url || bottle500,
      }));
    },
  });
}
