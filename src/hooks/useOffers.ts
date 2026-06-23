import { useQuery } from '@tanstack/react-query';

export interface Offer {
  id: string;
  title: string;
  description: string;
  original_price: number;
  sale_price: number;
  promo_code: string;
  discount_text: string;
  image_url: string;
  badge_text: string;
  color_gradient: string;
  icon_color: string;
  sort_order: number;
  is_active: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: async (): Promise<Offer[]> => {
      const res = await fetch(`${API_URL}/api/offers`);
      if (!res.ok) throw new Error('Failed to fetch offers');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
