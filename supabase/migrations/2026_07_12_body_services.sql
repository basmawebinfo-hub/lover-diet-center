-- Run this migration manually in Supabase before the seed file.
create extension if not exists pgcrypto;

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  name_en text not null, name_ar text not null, description_en text not null default '', description_ar text not null default '',
  sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.body_services (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.service_categories(id) on delete restrict,
  slug text unique not null, name_en text not null, name_ar text not null,
  short_description_en text not null default '', short_description_ar text not null default '',
  description_en text not null default '', description_ar text not null default '',
  benefits_en jsonb not null default '[]'::jsonb, benefits_ar jsonb not null default '[]'::jsonb,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  price numeric(10,2) not null check (price >= 0), compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price),
  badge_en text, badge_ar text, image_url text not null, gallery jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(), reference text unique not null default ('LDC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  service_id uuid not null references public.body_services(id) on delete restrict, user_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 2 and 80), phone text not null, email text,
  booking_date date not null, booking_time time not null, notes text check (char_length(notes) <= 500),
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  admin_notes text, source text not null default 'website', locale text not null default 'ar' check (locale in ('ar','en')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.service_reviews (
  id uuid primary key default gen_random_uuid(), service_id uuid references public.body_services(id) on delete set null,
  customer_name text not null, rating smallint not null check (rating between 1 and 5), comment_en text not null default '', comment_ar text not null default '',
  is_approved boolean not null default false, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.service_gallery (
  id uuid primary key default gen_random_uuid(), service_id uuid references public.body_services(id) on delete set null,
  image_url text not null, title_en text not null default '', title_ar text not null default '',
  kind text not null default 'service' check (kind in ('service','result','facility')),
  is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists body_services_category_idx on public.body_services(category_id, is_active, sort_order);
create index if not exists service_bookings_date_idx on public.service_bookings(booking_date, status);
create index if not exists service_bookings_service_idx on public.service_bookings(service_id, created_at desc);
create index if not exists service_reviews_approved_idx on public.service_reviews(is_approved, is_active, created_at desc);
create index if not exists service_gallery_order_idx on public.service_gallery(is_active, sort_order);

alter table public.service_categories enable row level security;
alter table public.body_services enable row level security;
alter table public.service_bookings enable row level security;
alter table public.service_reviews enable row level security;
alter table public.service_gallery enable row level security;

drop policy if exists "public_read_active_service_categories" on public.service_categories;
create policy "public_read_active_service_categories" on public.service_categories for select using (is_active = true);
drop policy if exists "public_read_active_body_services" on public.body_services;
create policy "public_read_active_body_services" on public.body_services for select using (is_active = true);
drop policy if exists "public_read_approved_service_reviews" on public.service_reviews;
create policy "public_read_approved_service_reviews" on public.service_reviews for select using (is_approved = true and is_active = true);
drop policy if exists "public_read_active_service_gallery" on public.service_gallery;
create policy "public_read_active_service_gallery" on public.service_gallery for select using (is_active = true);

-- Bookings are created only through the protected server route using the service-role client.
-- Admin CRUD also uses server routes after verifying the admin role.
