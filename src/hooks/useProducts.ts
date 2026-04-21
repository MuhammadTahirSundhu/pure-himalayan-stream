import { useQuery } from '@tanstack/react-query';
import { Product } from '@/data/products';

const API_URL = import.meta.env.VITE_API_URL || '';

// Temporary mapping for local image resolution
import bottle300 from '@/assets/brand/bottle-300ml.png';
import bottle500 from '@/assets/brand/bottle-500ml.png';
import bottle1000 from '@/assets/brand/bottle-1000ml.png';
import bottle1500 from '@/assets/brand/bottle-1500ml.png';
import bottle19l from '@/assets/brand/bottle-19l.png';

const imageMap: Record<string, string> = {
  'bottle-300ml.png': bottle300,
  'bottle-500ml.png': bottle500,
  'bottle-1000ml.png': bottle1000,
  'bottle-1500ml.png': bottle1500,
  'bottle-19l.png': bottle19l,
};

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();
      
      // Map string image_url to actual local Vite image reference
      return data.map(p => ({
        ...p,
        image: imageMap[p.image_url as unknown as string] || p.image_url
      }));
    }
  });
}
