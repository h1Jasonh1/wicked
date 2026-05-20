-- =====================================================================
-- WICKED skincare — initial Supabase schema
-- =====================================================================
-- Run this in the Supabase SQL editor (or via the Supabase CLI) on a fresh
-- project. Idempotent: safe to re-run; uses CREATE ... IF NOT EXISTS where
-- possible. Drop policies first if you need to fully replace them.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  marketing_emails boolean not null default true,
  order_sms_updates boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text,
  address_line_1 text not null,
  address_line_2 text,
  suburb text,
  city text not null,
  province text,
  postal_code text not null,
  country text not null default 'South Africa',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);
create unique index if not exists addresses_one_default_per_user
  on public.addresses(user_id) where is_default;

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  brand text,
  category text,
  product_type text,
  collection text,
  tag text,
  badge text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2),
  currency text not null default 'ZAR',
  images text[] default '{}',
  featured_image text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating numeric(3, 2),
  review_count integer not null default 0,
  skin_types text[] default '{}',
  concerns text[] default '{}',
  filters text[] default '{}',
  benefits text[] default '{}',
  ingredients text[] default '{}',
  specs text[] default '{}',
  variants text[] default '{}',
  sizes text[] default '{}',
  visual jsonb,
  long_description text,
  care text,
  delivery text,
  returns text,
  release_rank integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_featured_idx on public.products(is_featured) where is_featured;
create index if not exists products_category_idx on public.products(category);
create index if not exists products_slug_idx on public.products(slug);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  selected_variant text,
  selected_size text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cart_items_user_product_unique
  on public.cart_items(user_id, product_id, coalesce(selected_variant, ''), coalesce(selected_size, ''));
create index if not exists cart_items_user_id_idx on public.cart_items(user_id);

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- wishlist_items
-- ---------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items(user_id);

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1048;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text not null unique
    default ('WCK-' || nextval('public.order_number_seq')),
  status text not null default 'Order Placed',
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount_total numeric(12, 2) not null default 0 check (discount_total >= 0),
  delivery_total numeric(12, 2) not null default 0 check (delivery_total >= 0),
  total numeric(12, 2) not null check (total >= 0),
  currency text not null default 'ZAR',
  delivery_address jsonb,
  payment_status text not null default 'Pending',
  payment_provider text,
  payment_reference text,
  promo_code text,
  customer_email text,
  customer_phone text,
  customer_name text,
  tracking_provider text,
  tracking_number text,
  tracking_url text,
  estimated_delivery timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  product_name text not null,
  product_price numeric(12, 2) not null check (product_price >= 0),
  product_image text,
  quantity integer not null check (quantity > 0),
  total numeric(12, 2) not null check (total >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- promo_codes
-- ---------------------------------------------------------------------
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(12, 2) not null check (value >= 0),
  usage_limit integer,
  used_count integer not null default 0,
  minimum_order_amount numeric(12, 2),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists promo_codes_set_updated_at on public.promo_codes;
create trigger promo_codes_set_updated_at
before update on public.promo_codes
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  order_reference text,
  message text not null,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.promo_codes enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: users can view & update only their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

-- addresses: full ownership
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses
for select using (auth.uid() = user_id);

drop policy if exists "addresses_modify_own" on public.addresses;
create policy "addresses_modify_own" on public.addresses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- categories & products: public read for active rows
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
for select using (is_active = true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (is_active = true);

-- cart_items: full ownership
drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own" on public.cart_items
for select using (auth.uid() = user_id);

drop policy if exists "cart_items_modify_own" on public.cart_items;
create policy "cart_items_modify_own" on public.cart_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- wishlist_items: full ownership
drop policy if exists "wishlist_items_select_own" on public.wishlist_items;
create policy "wishlist_items_select_own" on public.wishlist_items
for select using (auth.uid() = user_id);

drop policy if exists "wishlist_items_modify_own" on public.wishlist_items;
create policy "wishlist_items_modify_own" on public.wishlist_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: read & insert own (no update/delete from client; admin-only)
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
for insert with check (auth.uid() = user_id);

-- order_items: read items belonging to one of your orders, insert allowed
-- only when the parent order also belongs to you
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
for insert with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

-- promo_codes: public read of active codes (for client-side validation)
drop policy if exists "promo_codes_public_read" on public.promo_codes;
create policy "promo_codes_public_read" on public.promo_codes
for select using (is_active = true);

-- newsletter_subscribers: public insert allowed (for capture form)
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
for insert with check (true);

-- contact_messages: public insert allowed
drop policy if exists "contact_public_insert" on public.contact_messages;
create policy "contact_public_insert" on public.contact_messages
for insert with check (true);
