-- supabase/schema.sql
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Create tables

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  size text NOT NULL,
  price numeric NOT NULL,
  description text,
  image_url text,
  category text NOT NULL CHECK (category IN ('bottle', 'dispenser')),
  in_stock boolean DEFAULT true
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  area text,
  street text NOT NULL,
  payment_method text NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  screenshot_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  price_at_time numeric NOT NULL
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percentage numeric NOT NULL,
  is_active boolean DEFAULT true
);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- 2. Insert Seed Data for Products
INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock) VALUES
('300ml', 'One Water 300ml', '300ml', 30, 'Perfect for on-the-go hydration. Pure Himalayan mineral water in a compact bottle.', 'bottle-300ml.png', 'bottle', true),
('500ml', 'One Water 500ml', '500ml', 50, 'Our most popular size. Ideal for daily use, gym, and travel.', 'bottle-500ml.png', 'bottle', true),
('1000ml', 'One Water 1L', '1L', 80, 'Family-friendly size. Great for home and office use.', 'bottle-1000ml.png', 'bottle', true),
('1500ml', 'One Water 1.5L', '1.5L', 100, 'Maximum hydration for the whole family. Premium Himalayan purity.', 'bottle-1500ml.png', 'bottle', true),
('19l', 'One Water 19L Dispenser', '19L', 250, 'Home & office dispenser bottle. Refundable deposit PKR 1,000 for first order.', 'bottle-19l.png', 'dispenser', true);

-- Insert Seed Promo Codes
INSERT INTO public.promo_codes (code, discount_percentage) VALUES
('EID2026', 15),
('WELCOME5', 5);

-- 3. Storage Bucket for Screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_screenshots', 'payment_screenshots', true);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies
-- Products: Read for everyone, Write for authenticated users
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
-- Orders & Contact Messages: Insert for everyone (public forms), Select for authenticated (Admins)
CREATE POLICY "Public insert for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- Promo codes: Read for everyone to validate at checkout
CREATE POLICY "Public read access for promo_codes" ON public.promo_codes FOR SELECT USING (true);
-- Storage bucket policy (allow public inserts)
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment_screenshots');
