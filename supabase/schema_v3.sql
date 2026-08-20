-- Skema v3 UcapanPacar — tambah kolom email untuk notifikasi
-- Jalankan di Supabase SQL Editor (aman dijalankan ulang)

alter table public.ucapan add column if not exists email text;