-- Skema Supabase untuk UcapanPacar
-- Jalankan di Supabase SQL Editor saat siap upgrade dari mode localStorage.

-- Template (seed opsional; frontend punya registry sendiri)
create table if not exists public.templates (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  type text not null,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Ucapan (produk utama)
create table if not exists public.ucapan (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  template_slug text not null,
  to_name text not null default 'Sayang',
  from_name text not null default 'Kesayanganmu',
  title text not null default 'Untuk Kamu',
  message text not null default '',
  photos text[] default '{}',
  music_url text,
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pembayaran
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  ucapan_id uuid references public.ucapan(id) on delete cascade,
  merchant_ref text unique not null,
  method text,
  amount bigint not null default 8900,
  status text not null default 'UNPAID',
  tripay_ref text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Jejak kunjungan (real-time)
create table if not exists public.views (
  id bigint generated always as identity primary key,
  ucapan_id uuid references public.ucapan(id) on delete cascade,
  lat double precision,
  lng double precision,
  duration_seconds int default 0,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

-- RLS: hanya pemilik yang bisa akses ucapan & payment-nya
alter table public.ucapan enable row level security;
alter table public.payments enable row level security;

create policy "pemilik bisa baca ucapan" on public.ucapan
  for select using (owner_id = auth.uid());

create policy "pemilik bisa buat ucapan" on public.ucapan
  for insert with check (owner_id = auth.uid());

create policy "pemilik bisa update ucapan" on public.ucapan
  for update using (owner_id = auth.uid());

create policy "pemilik bisa hapus ucapan" on public.ucapan
  for delete using (owner_id = auth.uid());

-- Realtime untuk tracking kunjungan
alter publication supabase_realtime add table public.views;

-- View agregat kunjungan per ucapan (untuk dashboard)
create or replace view public.ucapan_stats as
select
  u.id as ucapan_id,
  count(v.id) as total_views,
  min(v.first_seen) as first_view_at,
  max(v.last_seen) as last_view_at
from public.ucapan u
left join public.views v on v.ucapan_id = u.id
group by u.id;
