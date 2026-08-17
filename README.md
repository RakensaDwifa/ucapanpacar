# UcapanPacar — Replika

Website ucapan digital untuk pacar (love letter, birthday, anniversary). Dibuat dengan
Next.js 16 + Tailwind CSS + Framer Motion, backend Supabase (auth Google/magic link, DB,
upload foto, tracking kunjungan), pembayaran Midtrans (QRIS & e-wallet).

Live: https://ucapanpacar.vercel.app

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Mode Demo vs Produksi

- **Mode demo (default):** tanpa konfigurasi apa pun, pembayaran disimulasikan dan data
  disimpan di localStorage browser. Cocok untuk uji alur (buat → bayar → bagikan → dashboard).
- **Mode produksi:** salin `.env.example` ke `.env.local` dan isi kunci Midtrans
  (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MODE`, `MIDTRANS_CALLBACK_URL`)
  serta Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`). Skema tersedia di `supabase/schema_v2.sql`.

## Struktur

| Jalur | Fungsi |
|---|---|
| `/` | Landing page |
| `/templates` | Daftar & filter template |
| `/buat/[slug]` | Builder multi-step + live preview |
| `/checkout/[id]` | Pembayaran Midtrans Snap (demo otomatis bila tanpa key) |
| `/t/[slug]/[id]` | Halaman publik ucapan (tracking kunjungan) |
| `/dashboard` | Kelola ucapan, share link/QR, stats |
| `components/templates/` | Template interaktif (daftarkan di `registry.tsx`) |

Tambah template baru = buat komponen di `components/templates/`, daftarkan di
`registry.tsx`, lalu tambahkan meta di `lib/templates.ts`.
