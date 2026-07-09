-- =====================================================================
-- Guest Checkout support
-- Run this in the Supabase SQL editor (project: lover-diet-center7).
--
-- 1. orders.user_id becomes nullable (guest orders have no profile).
-- 2. Guest contact/shipping fields live directly on the order row.
-- 3. Guest orders are created ONLY through the server API route
--    (/api/orders/guest) using the service-role key, so no anon RLS
--    insert policy is required. Authenticated flow is unchanged.
-- =====================================================================

-- 1) Allow orders without a profile
alter table public.orders
  alter column user_id drop not null;

-- 2) Guest fields (all nullable — unused for authenticated orders)
alter table public.orders
  add column if not exists is_guest    boolean not null default false,
  add column if not exists guest_name  text,
  add column if not exists guest_phone text,
  add column if not exists guest_email text,
  add column if not exists guest_city  text,
  add column if not exists guest_address text,
  add column if not exists guest_notes text;

-- 3) Integrity: a guest order must carry contact info; an authed order
--    must carry a user_id.
alter table public.orders
  drop constraint if exists orders_guest_contact_check;
alter table public.orders
  add constraint orders_guest_contact_check check (
    (is_guest = false and user_id is not null)
    or
    (is_guest = true and guest_name is not null and guest_phone is not null)
  );

-- 4) Helpful index for admin lookups of guest orders by phone
create index if not exists orders_guest_phone_idx
  on public.orders (guest_phone)
  where is_guest = true;

-- NOTE (RLS): existing policies that scope orders by auth.uid() = user_id
-- keep working. Guest rows (user_id is null) are invisible to anon/authed
-- clients and only reachable via the service-role key — which is exactly
-- what we want: guests get their confirmation at order time, admins see
-- the order in the dashboard (admin queries use the service role / admin
-- policies).
