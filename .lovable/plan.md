
# One Water — Complete Brand Website & Admin Panel

## Overview
Build a premium, production-ready website for "One Water," a Pakistani Himalayan mineral water brand, with a full admin panel. React + Vite + Tailwind CSS frontend with Supabase backend for database, storage, and edge functions.

## Design System
- **Colors:** Aquamarine blues (#0EA5E9, #0284C7), clean whites (#F8FAFC), eco greens (#10B981), deep navy (#0F172A) for contrast
- **Typography:** Inter for body, Poppins for headings — clean, premium feel
- **Vibe:** "Pure. Transparent. Pakistani." — Refreshing gradients, glass-morphism cards, water-ripple animations

## AI-Generated Brand Images
Generate all imagery using AI during build:
- Hero background: Himalayan mountains with crystal water
- Product bottles: 300ml, 500ml, 1L, 1.5L, 19L renders
- Trust badges: PSQCA certified, Eco-Friendly, Himalayan Source icons
- About Us and Events contextual images
- Extract and use any relevant images from the uploaded `IMages.zip`

---

## Customer-Facing Pages

### 1. Home Page
- Full-width hero with AI-generated Himalayan backdrop, tagline "Pure. Transparent. Pakistani."
- Animated trust badges row (PSQCA, Himalayan Source, Eco-Friendly)
- Featured products carousel (all bottle sizes)
- Current promotions banner
- Quick CTA to order

### 2. Products Page
- Grid of all bottle sizes (300ml, 500ml, 1L, 1.5L, 19L)
- Each card: AI-generated bottle image, description, price (PKR), "Add to Cart" button
- Filter/sort options

### 3. 19L Delivery / Subscription Page
- Clear separation: Refundable deposit (PKR 1,000) vs. refill cost
- Delivery schedule dropdown: Weekly, Bi-weekly, Custom
- "Empty Bottles Returning" field
- Add to cart flow

### 4. Quality & Purity Page
- Interactive 10-step purification process diagram (animated steps)
- PSQCA compliance table: Allowed Max vs. Actual Results
- Download lab reports (PDF) button

### 5. Special Offers Page
- Grid of Eid bundles, Ramadan packs, event discounts
- Promo code input field
- Countdown timers for limited offers

### 6. Events & Bulk Orders Page
- **Smart Quote Calculator:** Guest count + event date + location → recommended quantity & estimated price
- Custom label printing option
- Ramadan charity donation toggle
- Inquiry form

### 7. About Us Page
- Brand story with Himalayan source narrative
- Company timeline/history
- Eco-friendly commitment section
- Team photos (AI-generated contextual images)

### 8. Contact Us Page
- WhatsApp direct chat button (opens wa.me link)
- Phone & email info
- Embedded Google Map of Gujranwala plant
- Contact form

---

## Shopping Cart & Checkout Flow

### Cart
- Slide-out sidebar cart showing items, quantities, subtotal
- Promo code application
- "Proceed to Checkout" button

### Checkout (Multi-Step)
1. **Delivery Details:** Name, Phone, City, Area, Street address
2. **Payment Method:** Easypaisa / JazzCash / SadaPay-NayaPay / COD selection
3. **Account Display:** Show admin's account number for selected method (from Supabase settings)
4. **Screenshot Upload:** File upload component for payment proof (stored in Supabase Storage)
5. **Success Page:** Order reference number, summary, WhatsApp confirmation link

---

## Admin Panel (`/admin`)

### Authentication
- Simple password gate (configurable password stored in Supabase)
- Session persisted in localStorage

### Dashboard
- Today's orders count, pending payments, total revenue cards
- Recent orders list
- Quick stats chart

### Order Management
- Filterable/searchable orders table
- Click to open order detail modal: customer info, items, payment screenshot viewer
- Status flow: Pending → Confirmed → Dispatched → Delivered
- Confirm/Reject buttons (rejection requires reason note)

### Product Management
- CRUD table for all bottle sizes
- Edit price, description, stock status, images

### Homepage & Offers Editor
- Edit hero banner text and image
- Toggle promotions on/off
- Generate and manage discount/promo codes

### Quality/Lab Reports Manager
- Edit PSQCA results table values
- Upload new lab report PDFs

### Settings
- Update contact info (phone, email, address)
- Update payment account numbers (Easypaisa, JazzCash, etc.)
- Update admin password
- SEO metadata fields

---

## Database (Supabase)
- **products** — id, name, size, price, description, image_url, stock_status, category
- **orders** — id, reference_number, customer_name, phone, city, area, street, payment_method, payment_screenshot_url, status, total, promo_code, notes, created_at
- **order_items** — id, order_id, product_id, quantity, price
- **promotions** — id, title, description, discount_type, discount_value, promo_code, active, start_date, end_date
- **site_settings** — key-value store for hero text, contact info, payment accounts, admin password hash
- **lab_reports** — id, title, file_url, created_at
- **quality_results** — id, parameter, allowed_max, actual_result, unit

## Storage Buckets
- `payment-screenshots` — customer payment proof uploads
- `lab-reports` — PDF lab reports
- `product-images` — product photos
- `site-assets` — hero images, brand assets

---

## Implementation Phases (all in one go)
1. Set up database schema, storage buckets, and RLS policies
2. Generate all AI brand images (hero, bottles, badges, contextual)
3. Build shared layout (navbar, footer, cart sidebar)
4. Build all 8 customer-facing pages
5. Build checkout flow with Supabase integration
6. Build admin panel with all management screens
7. Mobile responsiveness polish
