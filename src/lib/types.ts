// lib/types.ts — shapes returned by the OneWater API
export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  image: string;
  /** dispenser = returnable 19L bottle (deposit); accessory = dispensers, pumps, stands */
  category: 'bottle' | 'dispenser' | 'accessory';
  inStock: boolean;
}

export interface PaymentAccount { id: string; label: string; number: string; title: string; }

export interface SiteSettings {
  payment_accounts: PaymentAccount[];
  contact_info: { phone: string; whatsapp: string; email: string; address: string; hours: string };
  delivery_info: { bottle_deposit: number; charge_delivery: boolean; base_delivery_fee: number; free_delivery_threshold: number; delivery_time: string };
  service_areas: { cities: string[]; note: string };
  lab_report_url: string | null;
  business_hours: { open: string; close: string; closed_days: number[] };
  referral: { enabled: boolean; new_customer_discount: number; referrer_credit: number };
  google_review_url: string | null;
}

export interface Quote {
  lines: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; line_total: number; new_bottles: number; deposit: number }>;
  subtotal: number;
  deposit_total: number;
  discount: number;
  delivery_fee: number;
  referral_discount: number;
  credit_applied: number;
  total: number;
  promo_code: string | null;
  promo_error: string | null;
  referral_code: string | null;
  referral_error: string | null;
}

export interface TrackedOrder {
  order_ref: string;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'rejected';
  created_at: string;
  status_updated_at: string | null;
  total: string;
  deposit_total: string;
  payment_method: string;
  preferred_slot: string | null;
  delivery_schedule: string | null;
  items: Array<{ product_id: string; name: string; quantity: number; new_bottles: number }>;
  customer: { bottles_held: number; referral_credit: number; referral_code: string | null } | null;
  google_review_url: string | null;
}
