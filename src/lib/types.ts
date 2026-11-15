// lib/types.ts — shapes returned by the OneWater API
export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  image: string;
  category: 'bottle' | 'dispenser';
  inStock: boolean;
}

export interface PaymentAccount { id: string; label: string; number: string; title: string; }

export interface SiteSettings {
  payment_accounts: PaymentAccount[];
  contact_info: { phone: string; whatsapp: string; email: string; address: string; hours: string };
  delivery_info: { bottle_deposit: number; charge_delivery: boolean; base_delivery_fee: number; free_delivery_threshold: number; delivery_time: string };
  service_areas: { cities: string[]; note: string };
  lab_report_url: string | null;
}

export interface Quote {
  lines: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; line_total: number; new_bottles: number; deposit: number }>;
  subtotal: number;
  deposit_total: number;
  discount: number;
  delivery_fee: number;
  total: number;
  promo_code: string | null;
  promo_error: string | null;
}
