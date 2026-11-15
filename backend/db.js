// db.js — OneWater Pakistan
// PostgreSQL connection pool + database auto-initialization with seeding

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DEFAULT_SETTINGS } from './lib/settings.js';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase pooler needs SSL; a local Postgres (dev) does not.
  ssl: /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '') ? false : { rejectUnauthorized: false },
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
        ('300ml',  'One Water 300ml',          '300ml', 30,  'Perfect for on-the-go hydration. Purified mineral water in a compact bottle.', 'bottle-300ml.png',  'bottle',    true),
        ('500ml',  'One Water 500ml',          '500ml', 50,  'Our most popular size. Ideal for daily use, gym, and travel.',                       'bottle-500ml.png',  'bottle',    true),
        ('1000ml', 'One Water 1L',             '1L',    80,  'Family-friendly size. Great for home and office use.',                               'bottle-1000ml.png', 'bottle',    true),
        ('1500ml', 'One Water 1.5L',           '1.5L',  100, 'Maximum hydration for the whole family. 10-stage purified and lab-tested.',                  'bottle-1500ml.png', 'bottle',    true),
        ('19l',    'One Water 19L Dispenser',  '19L',   250, 'Home & office dispenser bottle. Refundable PKR 1,000 deposit per new bottle — free when you exchange an empty.',      'bottle-19l.png',    'dispenser', true)
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
        ('WELCOME5',    5),
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
      const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
      let rawPassword = process.env.ADMIN_INITIAL_PASSWORD;
      if (!rawPassword) {
        // Never fall back to a password that lives in source control.
        rawPassword = crypto.randomBytes(12).toString('base64url');
        console.log(`   ⚠️  ADMIN_INITIAL_PASSWORD not set — generated one-time password: ${rawPassword}`);
      }
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

    // ── Offers (Dynamic Promo Blocks) ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.offers (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text NOT NULL,
        original_price numeric DEFAULT 0,
        sale_price numeric DEFAULT 0,
        promo_code text NOT NULL,
        discount_text text NOT NULL,
        image_url text,
        badge_text text,
        color_gradient text,
        icon_color text,
        sort_order integer DEFAULT 0,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
    `);

    const offerCount = await client.query('SELECT COUNT(*) AS c FROM public.offers');
    if (parseInt(offerCount.rows[0].c) === 0) {
      console.log('🌱 Seeding offers...');
      await client.query(`
        INSERT INTO public.offers (id, title, description, original_price, sale_price, promo_code, discount_text, image_url, badge_text, color_gradient, icon_color, sort_order) VALUES
        ('welcome-offer', 'New Customer Welcome', 'First order with One Water? Get 5% off your water — one use per phone number.', 0, 0, 'WELCOME5', '5% OFF', '/assets/brand/bottle-500ml.png', '🎁 Welcome', 'from-violet-500/20 to-violet-700/5', 'text-violet-400', 1),
        ('bulk-20', 'Bulk & Event Orders', 'Ordering for an office, wedding or event? Get 20% off water orders of PKR 5,000 or more.', 0, 0, 'ONEWATER20', '20% OFF', '/assets/brand/bottle-1500ml.png', '📦 Bulk', 'from-blue-500/20 to-blue-700/5', 'text-blue-400', 2)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── Migrations (idempotent) ───────────────────────────────────────────
    await runMigrations(client);

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
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

const columnExists = async (client, table, column) => {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return rows.length > 0;
};

/** Adds a column if missing; returns true when it was just created. */
const addColumn = async (client, table, column, ddl) => {
  if (await columnExists(client, table, column)) return false;
  await client.query(`ALTER TABLE public.${table} ADD COLUMN ${column} ${ddl}`);
  return true;
};

async function runMigrations(client) {
  // Orders: server-computed money breakdown, promo audit trail, 19L details
  await addColumn(client, 'orders', 'subtotal', 'numeric');
  await addColumn(client, 'orders', 'deposit_total', 'numeric NOT NULL DEFAULT 0');
  await addColumn(client, 'orders', 'discount', 'numeric NOT NULL DEFAULT 0');
  await addColumn(client, 'orders', 'delivery_fee', 'numeric NOT NULL DEFAULT 0');
  await addColumn(client, 'orders', 'promo_code', 'text');
  await addColumn(client, 'orders', 'delivery_schedule', 'text');
  await addColumn(client, 'orders', 'customer_note', 'text');
  await addColumn(client, 'orders', 'status_updated_at', 'timestamptz');
  await addColumn(client, 'order_items', 'new_bottles', 'integer NOT NULL DEFAULT 0');
  await addColumn(client, 'order_items', 'deposit_at_time', 'numeric NOT NULL DEFAULT 0');

  // Promo codes: expiry, usage caps, minimum order, one-per-customer
  await addColumn(client, 'promo_codes', 'expires_at', 'timestamptz');
  await addColumn(client, 'promo_codes', 'max_uses', 'integer');
  await addColumn(client, 'promo_codes', 'times_used', 'integer NOT NULL DEFAULT 0');
  await addColumn(client, 'promo_codes', 'min_order_amount', 'numeric NOT NULL DEFAULT 0');
  if (await addColumn(client, 'promo_codes', 'once_per_customer', 'boolean NOT NULL DEFAULT false')) {
    await client.query(`UPDATE public.promo_codes SET once_per_customer = true WHERE code = 'WELCOME5'`);
    await client.query(`UPDATE public.promo_codes SET min_order_amount = 5000 WHERE code = 'ONEWATER20' AND min_order_amount = 0`);
  }

  // Inbox state for messages and event leads; phone-first contact
  await addColumn(client, 'contact_messages', 'is_read', 'boolean NOT NULL DEFAULT false');
  await client.query('ALTER TABLE public.contact_messages ALTER COLUMN email DROP NOT NULL');
  await addColumn(client, 'event_inquiries', 'event_type', 'text');
  await addColumn(client, 'event_inquiries', 'status', `text NOT NULL DEFAULT 'new'`);

  // Admin sessions can be revoked by bumping token_version
  await addColumn(client, 'admin_users', 'token_version', 'integer NOT NULL DEFAULT 0');

  // "Bring One Water to my city" waitlist — expansion demand signal
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.city_waitlist (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      phone text NOT NULL,
      city text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  `);

  // Settings: insert any missing keys with real defaults
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.query(
      'INSERT INTO public.site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, JSON.stringify(value)]
    );
  }
  // Replace the original placeholder seeds (fake numbers) — never real data.
  await client.query(
    `UPDATE public.site_settings SET value = $1 WHERE key = 'payment_accounts' AND jsonb_typeof(value) = 'object'`,
    [JSON.stringify(DEFAULT_SETTINGS.payment_accounts)]
  );
  await client.query(
    `UPDATE public.site_settings SET value = $1 WHERE key = 'contact_info' AND value->>'phone' = '+92 300 123 4567'`,
    [JSON.stringify(DEFAULT_SETTINGS.contact_info)]
  );
  await client.query(
    `UPDATE public.site_settings SET value = $1 WHERE key = 'delivery_info' AND NOT (value ? 'bottle_deposit')`,
    [JSON.stringify(DEFAULT_SETTINGS.delivery_info)]
  );

  // Product copy: the water is purified in our Gujranwala plant, not Himalayan.
  await client.query(`UPDATE public.products SET description = 'Perfect for on-the-go hydration. Purified mineral water in a compact bottle.'
    WHERE description = 'Perfect for on-the-go hydration. Pure Himalayan mineral water in a compact bottle.'`);
  await client.query(`UPDATE public.products SET description = 'Maximum hydration for the whole family. 10-stage purified and lab-tested.'
    WHERE description = 'Maximum hydration for the whole family. Premium Himalayan purity.'`);
}

export default pool;
