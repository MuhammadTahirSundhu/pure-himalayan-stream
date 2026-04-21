import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase generic connections
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log("Checking and creating necessary tables...");
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id text PRIMARY KEY,
        name text NOT NULL,
        size text NOT NULL,
        price numeric NOT NULL,
        description text,
        image_url text,
        category text NOT NULL CHECK (category IN ('bottle', 'dispenser')),
        in_stock boolean DEFAULT true
      );
    `);

    // We check if the products table is empty, and seed it if so.
    const res = await client.query('SELECT COUNT(*) as exact_count FROM public.products;');
    if (parseInt(res.rows[0].exact_count) === 0) {
      console.log("Seeding products...");
      await client.query(`
        INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock) VALUES
        ('300ml', 'One Water 300ml', '300ml', 30, 'Perfect for on-the-go hydration. Pure Himalayan mineral water in a compact bottle.', 'bottle-300ml.png', 'bottle', true),
        ('500ml', 'One Water 500ml', '500ml', 50, 'Our most popular size. Ideal for daily use, gym, and travel.', 'bottle-500ml.png', 'bottle', true),
        ('1000ml', 'One Water 1L', '1L', 80, 'Family-friendly size. Great for home and office use.', 'bottle-1000ml.png', 'bottle', true),
        ('1500ml', 'One Water 1.5L', '1.5L', 100, 'Maximum hydration for the whole family. Premium Himalayan purity.', 'bottle-1500ml.png', 'bottle', true),
        ('19l', 'One Water 19L Dispenser', '19L', 250, 'Home & office dispenser bottle. Refundable deposit PKR 1,000 for first order.', 'bottle-19l.png', 'dispenser', true);
      `);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
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
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.order_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
        product_id text REFERENCES public.products(id),
        product_name text NOT NULL,
        quantity integer NOT NULL,
        price_at_time numeric NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.contact_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        phone text,
        email text NOT NULL,
        message text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.promo_codes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code text NOT NULL UNIQUE,
        discount_percentage numeric NOT NULL,
        is_active boolean DEFAULT true
      );
    `);

    await client.query('COMMIT');
    console.log("Database initialized successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Failed to initialize database:", err);
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
