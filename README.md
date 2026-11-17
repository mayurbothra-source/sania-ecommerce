# SANIA – Cotton Kurtis e-commerce

Next.js 16 (App Router, TypeScript) · Tailwind CSS 3 · Supabase (Postgres + Auth + RLS) · Cloudinary · Razorpay Standard Checkout · Vercel.

*Pretty, comfy & easy on the pocket.*

## What's included
Storefront (home, shop with filters/sort, product pages, cart, checkout, confirmation, order tracking) and a password-protected admin (products, sizes & stock, images, orders, CSV export, testimonials, shipping charges, dashboard). The seven catalogue products SAN-01…SAN-07 are seeded with their descriptions, specs and front/back photos. **Prices, sizes and stock are not seeded** – set them in Admin.

## Setup (≈20 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → run `supabase/migrations/001_schema.sql`, then `002_seed.sql`.
3. Authentication → Users → **Add user** (email + password, tick *auto-confirm*). This is the admin login.
4. Project Settings → API: copy the URL, `anon` key and `service_role` key.

### 2. Razorpay
Dashboard → Settings → API Keys → generate **Test** keys first. Later: Webhooks → add `https://YOUR-DOMAIN/api/webhook/razorpay` with events `payment.captured`, `order.paid`, `payment.failed`, and set a secret (this is `RAZORPAY_WEBHOOK_SECRET`).

### 3. Cloudinary
Create a free account; copy cloud name, API key and secret.

### 4. Run locally
```bash
cp .env.example .env.local   # fill in values; this file is git-ignored
npm install
npm run dev                  # http://localhost:3000   (admin: /admin)
```

### 5. Deploy on Vercel (auto-deploys on every push to `main`)
1. vercel.com → **Add New → Project** → import the GitHub repo `sania-ecommerce`. Framework: Next.js (auto).
2. **Settings → Environment Variables**: add every variable from `.env.example` (mark secrets as *Sensitive*). Set `NEXT_PUBLIC_SITE_URL` to your live URL.
3. Deploy. From then on, each push to `main` creates a production deployment; other branches get preview URLs.
4. Add the Razorpay webhook URL (step 2) and switch to **Live** keys when ready.

## Security design
- Prices, shipping and stock are recomputed from the database on the server; the browser only sends product id, size, quantity.
- Razorpay payments are confirmed **only** after server-side HMAC signature verification + an amount/status check against Razorpay's API. A webhook is a backup path.
- `confirm_order_payment()` (Postgres, row-locked) marks an order paid and deducts stock exactly once; replays are no-ops. If stock ran out between order and payment, the order is flagged **STOCK ISSUE** for manual refund instead of overselling.
- RLS is enabled on every table. The public key can only read active catalogue data; orders and customer data are reachable only through server routes using the service-role key.
- Admin routes check a Supabase session cookie (httpOnly) **and** an `ADMIN_EMAILS` allow-list.
- No card data is ever handled or stored. Secrets live only in server-side environment variables.

## Owner's guide (Admin → `/admin`)
- **Add a product**: Products → *Add product* → fill details, MRP and selling price → *Create*. Then upload photos on the next screen.
- **Sizes & stock**: open a product → *Sizes & stock* → click `+ S`, `+ M`… → type pieces → untick *Available* to hide a size → *Save changes*. Remove a size with *Remove*. Tick *Mark out of stock* to block the whole product.
- **Photos**: open a product → *Add front/back/gallery photo* → check the preview → *Save image*. Use *Replace*, *Make main* or *Delete* on any photo. Images are shrunk and converted automatically.
- **Discount**: enter MRP higher than selling price; the % off appears automatically.
- **Featured / New arrivals**: tick the boxes on the product.
- **Orders**: Orders → search by order ID, name or mobile → open → change status, add courier + tracking → *Save*. *Cancel order* returns stock (refund the customer in the Razorpay dashboard). *Export CSV* downloads all orders.
- **Shipping**: Shipping → flat charge and optional free-shipping threshold.
- **Testimonials**: add real customer reviews; they appear on the home page.

> Editing stock numbers overwrites the live count, so avoid doing it in the seconds around a sale.

## Notes
- The original catalogue photos are bundled in `public/products/` (SAN-06 and SAN-07 are lower resolution in the source PDF). Re-upload better photos from Admin any time.
- Cloudinary-hosted images are served with automatic format/quality (`f_auto,q_auto`).
