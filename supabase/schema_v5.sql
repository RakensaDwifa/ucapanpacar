-- Migrasi schema_v5: Menambahkan kolom timeline JSONB pada tabel ucapan
ALTER TABLE public.ucapan
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT NULL;
