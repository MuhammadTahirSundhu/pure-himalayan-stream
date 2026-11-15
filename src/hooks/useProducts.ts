import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import bottle300 from '@/assets/brand/bottle-300ml.webp';
import bottle500 from '@/assets/brand/bottle-500ml.webp';
import bottle1000 from '@/assets/brand/bottle-1000ml.webp';
import bottle1500 from '@/assets/brand/bottle-1500ml.webp';
import bottle19l from '@/assets/brand/bottle-19l.webp';

// Seeded products reference bundled images by file name; admin uploads are full URLs.
const imageMap: Record<string, string> = {
  'bottle-300ml.png': bottle300,
  'bottle-500ml.png': bottle500,
  'bottle-1000ml.png': bottle1000,
  'bottle-1500ml.png': bottle1500,
  'bottle-19l.png': bottle19l,
};

interface ApiProduct { id: string; name: string; size: string; price: string | number; description: string | null; image_url: string | null; category: 'bottle' | 'dispenser' | 'accessory'; in_stock: boolean }

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Product[]> => {
      const data = await api<ApiProduct[]>('/api/products');
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        size: p.size,
        price: Number(p.price),
        description: p.description ?? '',
        category: p.category,
        inStock: p.in_stock,
        image: (p.image_url && imageMap[p.image_url]) || p.image_url || (p.category === 'dispenser' ? bottle19l : bottle500),
      }));
    },
  });
}

/** The returnable 19L product, if the catalogue has one. */
export const useDispenserProduct = () => {
  const q = useProducts();
  return { ...q, product: q.data?.find((p) => p.category === 'dispenser' && p.inStock) };
};
