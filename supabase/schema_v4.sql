-- Skema v4 UcapanPacar — perbaikan keamanan & performa (aman dijalankan ulang)

-- 1. RLS templates: aktifkan + publik hanya bisa baca
alter table public.templates enable row level security;

drop policy if exists "publik baca templates" on public.templates;
create policy "publik baca templates" on public.templates
  for select using (true);

-- 2. ucapan_stats: hilangkan SECURITY DEFINER (buat ulang sebagai invoker)
drop view if exists public.ucapan_stats;
create view public.ucapan_stats
with (security_invoker = true)
as
select
  u.id as ucapan_id,
  count(v.id) as total_views,
  min(v.first_seen) as first_view_at,
  max(v.last_seen) as last_view_at
from public.ucapan u
left join public.views v on v.ucapan_id = u.id
group by u.id;

-- 3. Index untuk FK (dashboard & join lebih cepat)
create index if not exists idx_payments_ucapan_id on public.payments (ucapan_id);
create index if not exists idx_ucapan_owner_id on public.ucapan (owner_id);
create index if not exists idx_views_ucapan_id on public.views (ucapan_id);

-- 4. Optimasi RLS: auth.uid() dievaluasi sekali per query
drop policy if exists "pemilik baca ucapan" on public.ucapan;
create policy "pemilik baca ucapan" on public.ucapan
  for select using ((select auth.uid()) = owner_id);

drop policy if exists "pemilik buat ucapan" on public.ucapan;
create policy "pemilik buat ucapan" on public.ucapan
  for insert with check ((select auth.uid()) = owner_id);

drop policy if exists "pemilik update ucapan" on public.ucapan;
create policy "pemilik update ucapan" on public.ucapan
  for update using ((select auth.uid()) = owner_id);

drop policy if exists "pemilik hapus ucapan" on public.ucapan;
create policy "pemilik hapus ucapan" on public.ucapan
  for delete using ((select auth.uid()) = owner_id);

drop policy if exists "pemilik baca payment" on public.payments;
create policy "pemilik baca payment" on public.payments
  for select using (exists (
    select 1 from public.ucapan u
    where u.id = payments.ucapan_id and (select auth.uid()) = u.owner_id
  ));

drop policy if exists "pemilik baca kunjungan" on public.views;
create policy "pemilik baca kunjungan" on public.views
  for select using (exists (
    select 1 from public.ucapan u
    where u.id = views.ucapan_id and (select auth.uid()) = u.owner_id
  ));