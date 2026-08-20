-- Skema v2 UcapanPacar — jalankan di Supabase SQL Editor (aman dijalankan ulang)
-- Isi: tabel + RLS (publik baca ucapan paid, tracking anonim) + realtime + bucket foto

create table if not exists public.templates (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  type text not null,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.ucapan (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
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

create table if not exists public.views (
  id bigint generated always as identity primary key,
  ucapan_id uuid references public.ucapan(id) on delete cascade,
  lat double precision,
  lng double precision,
  duration_seconds int default 0,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.ucapan enable row level security;
alter table public.payments enable row level security;
alter table public.views enable row level security;

drop policy if exists "pemilik baca ucapan" on public.ucapan;
create policy "pemilik baca ucapan" on public.ucapan
  for select using (owner_id = auth.uid());

drop policy if exists "publik baca ucapan yang sudah dibayar" on public.ucapan;
create policy "publik baca ucapan yang sudah dibayar" on public.ucapan
  for select using (paid = true);

drop policy if exists "pemilik buat ucapan" on public.ucapan;
create policy "pemilik buat ucapan" on public.ucapan
  for insert with check (owner_id = auth.uid());

drop policy if exists "pemilik update ucapan" on public.ucapan;
create policy "pemilik update ucapan" on public.ucapan
  for update using (owner_id = auth.uid());

drop policy if exists "pemilik hapus ucapan" on public.ucapan;
create policy "pemilik hapus ucapan" on public.ucapan
  for delete using (owner_id = auth.uid());

drop policy if exists "pemilik baca payment" on public.payments;
create policy "pemilik baca payment" on public.payments
  for select using (exists (
    select 1 from public.ucapan u where u.id = payments.ucapan_id and u.owner_id = auth.uid()
  ));

drop policy if exists "anonim catat kunjungan" on public.views;
create policy "anonim catat kunjungan" on public.views
  for insert with check (true);

drop policy if exists "pemilik baca kunjungan" on public.views;
create policy "pemilik baca kunjungan" on public.views
  for select using (exists (
    select 1 from public.ucapan u where u.id = views.ucapan_id and u.owner_id = auth.uid()
  ));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'views'
  ) then
    alter publication supabase_realtime add table public.views;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ucapan'
  ) then
    alter publication supabase_realtime add table public.ucapan;
  end if;
end $$;

create or replace view public.ucapan_stats as
select
  u.id as ucapan_id,
  count(v.id) as total_views,
  min(v.first_seen) as first_view_at,
  max(v.last_seen) as last_view_at
from public.ucapan u
left join public.views v on v.ucapan_id = u.id
group by u.id;

insert into storage.buckets (id, name, public, file_size_limit)
values ('foto', 'foto', true, 10485760)
on conflict (id) do nothing;

drop policy if exists "publik baca foto" on storage.objects;
create policy "publik baca foto" on storage.objects
  for select using (bucket_id = 'foto');

drop policy if exists "anonim upload foto" on storage.objects;
create policy "anonim upload foto" on storage.objects
  for insert with check (bucket_id = 'foto' and octet_length(name) > 0);

drop policy if exists "pemilik hapus foto" on storage.objects;
create policy "pemilik hapus foto" on storage.objects
  for delete using (bucket_id = 'foto' and owner_id = auth.uid()::text);
