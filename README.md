# UcapanPacar — Replika

Website ucapan digital untuk pacar (love letter, birthday, anniversary). Dibuat dengan
Next.js 15 + Tailwind CSS v4 + Framer Motion, backend Supabase (opsional), pembayaran Tripay.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Mode Demo vs Produksi

- **Mode demo (default):** tanpa konfigurasi apa pun, pembayaran disimulasikan dan data
  disimpan di localStorage browser. Cocok untuk uji alur (buat → bayar → bagikan → dashboard).
- **Mode produksi:** salin `.env.example` ke `.env.local` dan isi kunci Tripay
  (`TRIPAY_API_KEY`, `TRIPAY_PRIVATE_KEY`, `TRIPAY_MERCHANT_CODE`). Supabase menyusul —
  skema siap di `supabase/schema.sql`.

## Struktur

| Jalur | Fungsi |
|---|---|
| `/` | Landing page |
| `/templates` | Daftar & filter template |
| `/buat/[slug]` | Builder multi-step + live preview |
| `/checkout/[id]` | Pembayaran Tripay (demo otomatis bila tanpa key) |
| `/t/[slug]/[id]` | Halaman publik ucapan (tracking kunjungan) |
| `/dashboard` | Kelola ucapan, share link/QR, stats |
| `components/templates/` | Template interaktif (daftarkan di `registry.tsx`) |

Tambah template baru = buat komponen di `components/templates/`, daftarkan di
`registry.tsx`, lalu tambahkan meta di `lib/templates.ts`.
