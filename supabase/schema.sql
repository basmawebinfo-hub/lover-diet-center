-- =====================================================================
-- Lover Diet Center — Supabase schema, RLS, triggers, and seed data
-- Run this whole file in Supabase: SQL Editor -> New query -> Run
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1) PROFILES  (extends auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  name_en         text,
  name_ar         text,
  phone           text,
  age             int,
  gender          text check (gender in ('male','female')),
  height_cm       numeric,
  start_weight_kg numeric,
  current_weight  numeric,
  goal            text check (goal in ('lose_weight','gain_muscle','maintain','tone')),
  target_weight   numeric,
  activity_level  text,
  locale          text default 'en',
  role            text not null default 'user' check (role in ('user','admin')),
  has_seen_intro  boolean default false,
  created_at      timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name_en)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2) MEALS  (public catalog)
-- =====================================================================
create table if not exists public.meals (
  id              text primary key,
  name_en         text not null,
  name_ar         text,
  description_en  text,
  description_ar  text,
  image_url       text,
  calories        int,
  protein         int,
  carbs           int,
  fat             int,
  meal_type       text check (meal_type in ('breakfast','lunch','dinner','snack')),
  tags            text[] default '{}',
  created_at      timestamptz default now()
);

-- =====================================================================
-- 3) PRODUCTS  (public catalog)
-- =====================================================================
create table if not exists public.products (
  id              text primary key,
  name_en         text not null,
  name_ar         text,
  description_en  text,
  description_ar  text,
  image_url       text,
  price           numeric not null,
  category        text check (category in ('snack','supplement','meal','drink')),
  in_stock        boolean default true,
  created_at      timestamptz default now()
);

-- =====================================================================
-- 4) WEIGHT LOGS  (per user)
-- =====================================================================
create table if not exists public.weight_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  weight_kg    numeric not null,
  body_fat_pct numeric,
  note         text,
  created_at   timestamptz default now()
);
create index if not exists weight_logs_user_idx on public.weight_logs(user_id, date);

-- =====================================================================
-- 4b) WATER LOGS  (per user, one row per day)
-- =====================================================================
create table if not exists public.water_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  liters     numeric not null default 0,
  created_at timestamptz default now(),
  unique (user_id, date)
);
create index if not exists water_logs_user_idx on public.water_logs(user_id, date);


-- =====================================================================
-- 5) ORDERS + ORDER ITEMS
-- =====================================================================
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  total       numeric not null default 0,
  status      text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  created_at  timestamptz default now()
);
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        text references public.products(id),
  quantity          int not null default 1,
  price_at_purchase numeric not null
);

-- =====================================================================
-- 6) SESSIONS  (bookings)
-- =====================================================================
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  type             text check (type in ('consultation','body_sculpting','follow_up','training')),
  doctor_name      text,
  date             date,
  time             text,
  duration_minutes int,
  status           text default 'scheduled' check (status in ('scheduled','completed','cancelled','rescheduled')),
  location         text check (location in ('clinic','online')),
  notes            text,
  created_at       timestamptz default now()
);

-- =====================================================================
-- 7) MEAL PLANS + PLAN ITEMS
-- =====================================================================
create table if not exists public.meal_plans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  doctor_name    text,
  start_date     date,
  end_date       date,
  goal           text,
  daily_calories int,
  water_liters   numeric,
  notes_en       text,
  notes_ar       text,
  created_at     timestamptz default now()
);
create table if not exists public.plan_items (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.meal_plans(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  meal_id     text references public.meals(id)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.meals       enable row level security;
alter table public.products    enable row level security;
alter table public.weight_logs enable row level security;
alter table public.water_logs  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.sessions    enable row level security;
alter table public.meal_plans  enable row level security;
alter table public.plan_items  enable row level security;

-- Public catalogs: anyone (incl. anon) can READ meals & products
create policy "meals_public_read"    on public.meals    for select using (true);
create policy "products_public_read" on public.products for select using (true);

-- Profiles: a user can see / edit only their own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Per-user tables: full control over own rows only
create policy "weight_own" on public.weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "water_own" on public.water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders_own" on public.orders      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_own" on public.sessions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "plans_own" on public.meal_plans   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- order_items / plan_items: tied to the parent row's owner
create policy "order_items_own" on public.order_items for all
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()))
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "plan_items_own" on public.plan_items for all
  using (exists (select 1 from public.meal_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.meal_plans p where p.id = plan_id and p.user_id = auth.uid()));


-- =====================================================================
-- ADMIN ACCESS — admins can read/manage all rows
-- =====================================================================
-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Admins can read all profiles, weight logs, orders, sessions, plans
create policy "profiles_admin_read"  on public.profiles    for select using (public.is_admin());
create policy "weight_admin_read"    on public.weight_logs for select using (public.is_admin());
create policy "water_admin_read"     on public.water_logs  for select using (public.is_admin());
create policy "orders_admin_all"     on public.orders      for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin"    on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "sessions_admin_all"   on public.sessions    for all using (public.is_admin()) with check (public.is_admin());
create policy "plans_admin_all"      on public.meal_plans  for all using (public.is_admin()) with check (public.is_admin());

-- Admins can manage the public catalogs (meals & products)
create policy "meals_admin_write"    on public.meals    for all using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- SEED DATA — meals & products (from current app data)
-- =====================================================================
insert into public.meals (id, name_en, name_ar, description_en, description_ar, image_url, calories, protein, carbs, fat, meal_type, tags) values
  ('m1', 'Oats & Berry Bowl', 'شوفان مع التوت', 'Steel-cut oats with mixed berries, chia seeds, and almond milk.', 'شوفان مع توت مشكل وبذور شيا وحليب لوز.', '/meals/breakfast.png', 380, 14, 58, 9, 'breakfast', ARRAY['high-fiber','vegan','low-sugar']::text[]),  ('m2', 'Grilled Chicken Quinoa', 'دجاج مشوي مع كينوا', 'Lean chicken breast, quinoa, roasted veggies, lemon-tahini drizzle.', 'صدر دجاج مشوي، كينوا، خضار محمصة، صلصة ليمون وطحينة.', '/meals/lunch.png', 520, 42, 48, 14, 'lunch', ARRAY['high-protein','gluten-free']::text[]),  ('m3', 'Baked Salmon & Asparagus', 'سلمون مخبوز مع الهليون', 'Wild salmon, roasted asparagus, sweet potato mash.', 'سلمون بري، هليون محمص، بطاطا حلوة مهروسة.', '/meals/dinner.png', 610, 38, 42, 26, 'dinner', ARRAY['omega-3','low-carb']::text[]),  ('m4', 'Greek Yogurt & Honey', 'زبادي يوناني مع عسل', 'Plain Greek yogurt, raw honey, walnuts.', 'زبادي يوناني، عسل نحل طبيعي، عين جمل.', '/meals/snack.png', 220, 18, 18, 9, 'snack', ARRAY['high-protein']::text[]),  ('m5', 'Lentil Soup', 'شوربة عدس', 'Brown lentils, carrots, celery, cumin, lemon.', 'عدس بني، جزر، كرفس، كمون، ليمون.', '/meals/lunch.png', 340, 22, 48, 6, 'lunch', ARRAY['vegan','high-fiber']::text[]),  ('m6', 'Egg White Omelette', 'أومليت بياض البيض', 'Egg whites, spinach, mushrooms, feta, herbs.', 'بياض بيض، سبانخ، فطر، جبنة فيتا، أعشاب.', '/meals/breakfast.png', 280, 28, 8, 14, 'breakfast', ARRAY['high-protein','keto-friendly']::text[])
on conflict (id) do nothing;

insert into public.products (id, name_en, name_ar, description_en, description_ar, image_url, price, category, in_stock) values
  ('p1', 'Almond Energy Bites', 'كُرات اللوز للطاقة', 'Gluten-free protein bites. 12g protein per pack.', 'كُرات بروتين خالية من الجلوتين. 12جم بروتين للعلبة.', '/products/protein.png', 35, 'snack', true),  ('p2', 'Detox Green Tea', 'شاي أخضر ديتوكس', 'Organic green tea with ginger & lemongrass.', 'شاي أخضر عضوي مع الزنجبيل وليمون النجيل.', '/products/omega.png', 45, 'drink', true),  ('p3', 'Vegan Protein Powder', 'بروتين نباتي بودر', 'Plant-based protein, chocolate flavor, 1kg.', 'بروتين نباتي بنكهة الشوكولاتة، 1 كيلو.', '/products/protein.png', 220, 'supplement', true),  ('p4', 'Chia Pudding Cup', 'كيك الشيا', 'Ready-to-eat chia pudding with mango.', 'كيك شيا جاهز للأكل مع المانجو.', '/products/gainer.png', 28, 'snack', true),  ('p5', 'Keto Trail Mix', 'مكس مكسرات كيتو', 'Macadamia, pecans, pumpkin seeds, dark chocolate.', 'ماكديميا، بيكان، بذور يقطين، شوكولاتة داكنة.', '/products/burner.png', 55, 'snack', false),  ('p6', 'Daily Multivitamin', 'مالتي فيتامين يومي', '30-day supply, complete micronutrient profile.', 'عبوة 30 يوم، عناصر غذائية متكاملة.', '/products/omega.png', 120, 'supplement', true)
on conflict (id) do nothing;

-- Done. Tables, RLS, trigger, and seed data are ready.
