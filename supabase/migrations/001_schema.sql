-- SANIA e-commerce schema. Run in Supabase SQL editor (or `supabase db push`).
create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  slug text unique not null,
  name text not null,
  collection text not null default 'Long Cotton Kurtis',
  tagline text,
  description text,
  fabric text, fit text, sleeve text, length text, colour text, colour_hex text,
  perfect_for text[] not null default '{}',
  mrp numeric(10,2) check (mrp is null or mrp >= 0),
  price numeric(10,2) check (price is null or price >= 0),     -- selling price
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  out_of_stock boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  stock int not null default 0 check (stock >= 0),
  enabled boolean not null default true,
  sort_order int not null default 0,
  unique (product_id, size)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  kind text not null default 'gallery' check (kind in ('front','back','gallery')),
  is_main boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  quote text not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists settings (
  key text primary key,
  value text not null
);
insert into settings(key,value) values ('shipping_charge','0'),('free_shipping_above','0')
  on conflict do nothing;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  customer_name text not null,
  mobile text not null,
  email text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'Order Placed'
    check (status in ('Order Placed','Payment Confirmed','Processing','Dispatched','Delivered','Cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','cancelled','paid_stock_issue')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  courier text, tracking_no text, admin_note text,
  stock_deducted boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_mobile_idx on orders(mobile);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  code text not null, name text not null, size text not null,
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null,
  image text
);

-- Atomic, idempotent payment confirmation + stock deduction.
create or replace function confirm_order_payment(p_order_id uuid, p_payment_id text)
returns text language plpgsql security definer set search_path = public as $$
declare o orders; li record; ok boolean := true;
begin
  select * into o from orders where id = p_order_id for update;
  if not found then return 'not_found'; end if;
  if o.stock_deducted or o.payment_status in ('paid','paid_stock_issue') then return 'already'; end if;
  if o.status = 'Cancelled' then return 'cancelled'; end if;

  -- check all lines first, locking rows
  for li in select * from order_items where order_id = o.id loop
    perform 1 from product_sizes ps
      where ps.product_id = li.product_id and ps.size = li.size and ps.stock >= li.qty for update;
    if not found then ok := false; end if;
  end loop;

  if ok then
    update product_sizes ps set stock = ps.stock - it.qty
      from order_items it
      where it.order_id = o.id and ps.product_id = it.product_id and ps.size = it.size;
    update orders set payment_status='paid', status='Payment Confirmed', razorpay_payment_id=p_payment_id,
      stock_deducted=true, paid_at=now() where id = o.id;
    return 'paid';
  else
    -- money received but stock gone: flag for manual refund / fulfilment
    update orders set payment_status='paid_stock_issue', status='Payment Confirmed',
      razorpay_payment_id=p_payment_id, paid_at=now() where id = o.id;
    return 'stock_issue';
  end if;
end $$;
revoke all on function confirm_order_payment(uuid,text) from public, anon, authenticated;

-- Restore stock when a paid order is cancelled by admin.
create or replace function restore_order_stock(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from orders where id=p_order_id and stock_deducted) then
    update product_sizes ps set stock = ps.stock + it.qty
      from order_items it where it.order_id=p_order_id and ps.product_id=it.product_id and ps.size=it.size;
    update orders set stock_deducted=false where id=p_order_id;
  end if;
end $$;
revoke all on function restore_order_stock(uuid) from public, anon, authenticated;

-- Row Level Security: the public (anon) key can only READ the catalogue.
-- Orders / customers / settings are reachable only via server routes using the service-role key.
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table product_images enable row level security;
alter table testimonials enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "public read active products" on products for select using (is_active);
create policy "public read sizes" on product_sizes for select
  using (exists (select 1 from products p where p.id = product_id and p.is_active));
create policy "public read images" on product_images for select
  using (exists (select 1 from products p where p.id = product_id and p.is_active));
create policy "public read testimonials" on testimonials for select using (is_active);
create policy "public read shipping settings" on settings for select
  using (key in ('shipping_charge','free_shipping_above'));
-- no policies on orders/order_items => denied for anon/authenticated; service role bypasses RLS.
