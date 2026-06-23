// db.js — OneWater Pakistan
// PostgreSQL connection pool + database auto-initialization with seeding

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase pooler connections
  max: 10,                            // Max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

/**
 * initDB — runs on server startup.
 * Creates all tables if they don't exist and seeds default data.
 */
export const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing database...');
    await client.query('BEGIN');

    // ── Products ─────────────────────────────────────────────────────────
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

    const productCount = await client.query('SELECT COUNT(*) AS c FROM public.products');
    if (parseInt(productCount.rows[0].c) === 0) {
      console.log('🌱 Seeding products...');
      await client.query(`
        INSERT INTO public.products (id, name, size, price, description, image_url, category, in_stock) VALUES
        ('300ml',  'One Water 300ml',          '300ml', 30,  'Perfect for on-the-go hydration. Pure Himalayan mineral water in a compact bottle.', 'bottle-300ml.png',  'bottle',    true),
        ('500ml',  'One Water 500ml',          '500ml', 50,  'Our most popular size. Ideal for daily use, gym, and travel.',                       'bottle-500ml.png',  'bottle',    true),
        ('1000ml', 'One Water 1L',             '1L',    80,  'Family-friendly size. Great for home and office use.',                               'bottle-1000ml.png', 'bottle',    true),
        ('1500ml', 'One Water 1.5L',           '1.5L',  100, 'Maximum hydration for the whole family. Premium Himalayan purity.',                  'bottle-1500ml.png', 'bottle',    true),
        ('19l',    'One Water 19L Dispenser',  '19L',   250, 'Home & office dispenser bottle. Refundable deposit PKR 1,000 for first order.',      'bottle-19l.png',    'dispenser', true)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── Orders ────────────────────────────────────────────────────────────
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

    // ── Order Items ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.order_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
        product_id text NOT NULL,
        product_name text NOT NULL,
        quantity integer NOT NULL,
        price_at_time numeric NOT NULL
      );
    `);



    // ── Contact Messages ──────────────────────────────────────────────────
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

    // ── Promo Codes ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.promo_codes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code text NOT NULL UNIQUE,
        discount_percentage numeric NOT NULL,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
    `);

    // Patch for older databases that might have created the table before we added created_at
    await client.query(`
      ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
    `);

    const promoCount = await client.query('SELECT COUNT(*) AS c FROM public.promo_codes');
    if (parseInt(promoCount.rows[0].c) === 0) {
      console.log('🌱 Seeding promo codes...');
      await client.query(`
        INSERT INTO public.promo_codes (code, discount_percentage) VALUES
        ('EID2026',    15),
        ('WELCOME5',    5),
        ('RAMADAN10',  10),
        ('ONEWATER20', 20)
        ON CONFLICT (code) DO NOTHING;
      `);
    }

    // ── Site Settings ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.site_settings (
        key text PRIMARY KEY,
        value jsonb NOT NULL
      );
    `);

    // Seed default settings if table is empty
    const settingsCount = await client.query('SELECT COUNT(*) AS c FROM public.site_settings');
    if (parseInt(settingsCount.rows[0].c) === 0) {
      console.log('🌱 Seeding site settings...');
      const defaultSettings = [
        ['payment_accounts', { easypaisa: '0300-1234567', jazzcash: '0301-7654321', sadapay: '0302-9876543' }],
        ['contact_info',     { phone: '+92 300 123 4567', email: 'info@onewater.pk', address: 'GT Road, Gujranwala, Pakistan' }],
        ['delivery_info',    { free_delivery_threshold: 500, base_delivery_fee: 100, whatsapp: '923001234567' }],
      ];
      for (const [key, value] of defaultSettings) {
        await client.query(
          'INSERT INTO public.site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
          [key, JSON.stringify(value)]
        );
      }
    }

    // ── Admin Users ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        username text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    // Seed the default admin user from env vars (only if no admin exists)
    const adminCount = await client.query('SELECT COUNT(*) AS c FROM public.admin_users');
    if (parseInt(adminCount.rows[0].c) === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'OneWater@2026!';
      const hash = await bcrypt.hash(rawPassword, 12);
      await client.query(
        'INSERT INTO public.admin_users (username, password_hash) VALUES ($1, $2)',
        [username, hash]
      );
      console.log(`🔐 Default admin created → username: "${username}"`);
      console.log(`   ⚠️  Change the password immediately after first login!`);
    }

    // ── Event Inquiries ───────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.event_inquiries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        phone text NOT NULL,
        email text,
        event_date text,
        event_location text,
        bottle_size text,
        quantity text,
        notes text,
        created_at timestamptz DEFAULT now()
      );
    `);

    // ── Clients (Featured on Homepage) ───────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.clients (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        logo_url text,
        website_url text,
        sort_order integer DEFAULT 0,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully.\n');

    // ── Post-transaction patches (DDL that can't run inside transactions) ──
    // Drop old FK constraint on order_items.product_id if it exists
    try {
      const fkResult = await pool.query(`
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'order_items'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%product_id%'
      `);
      if (fkResult.rows.length > 0) {
        const constraintName = fkResult.rows[0].constraint_name;
        await pool.query(`ALTER TABLE public.order_items DROP CONSTRAINT "${constraintName}"`);
        console.log(`🔧 Dropped FK constraint: ${constraintName}`);
      }
    } catch (fkErr) {
      // Constraint may already be gone — that's fine
      console.log('ℹ️  FK patch skipped (already clean):', fkErr.message);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
