import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Testimonial { id: string; name: string; area: string | null; text: string; rating: number | null; source: string | null }
export interface GalleryItem { id: string; image_url: string; caption: string | null }

export const useTestimonials = () =>
  useQuery({ queryKey: ['testimonials'], queryFn: () => api<Testimonial[]>('/api/testimonials'), staleTime: 10 * 60 * 1000 });

export const useGallery = () =>
  useQuery({ queryKey: ['gallery'], queryFn: () => api<GalleryItem[]>('/api/gallery'), staleTime: 10 * 60 * 1000 });
