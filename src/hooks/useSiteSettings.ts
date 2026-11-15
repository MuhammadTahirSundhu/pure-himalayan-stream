import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

/** Shown instantly (and if the API is cold/unreachable) — real values load over it. */
export const FALLBACK_SETTINGS: SiteSettings = {
  payment_accounts: [],
  contact_info: {
    phone: '0320 313 3140',
    whatsapp: '923203133140',
    email: 'onewater.pk@gmail.com',
    address: 'Green Valley Phase 1, near Sialkot Bypass, Gujranwala',
    hours: 'Sat–Thu, 9:00 AM – 7:00 PM (Friday closed)',
  },
  delivery_info: { bottle_deposit: 1000, charge_delivery: false, base_delivery_fee: 0, free_delivery_threshold: 0, delivery_time: 'During business hours, 9 AM – 7 PM (Friday closed)' },
  service_areas: { cities: ['Gujranwala'], note: 'We deliver across all of Gujranwala city.' },
  lab_report_url: null,
};

export function useSiteSettings() {
  const q = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<SiteSettings>('/api/settings'),
    staleTime: 5 * 60 * 1000,
  });
  return { ...q, settings: q.data ?? FALLBACK_SETTINGS };
}

/** wa.me link with an optional pre-filled message. */
export const whatsappLink = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telLink = (phone: string) => `tel:+92${phone.replace(/\D/g, '').replace(/^(92|0)/, '')}`;
