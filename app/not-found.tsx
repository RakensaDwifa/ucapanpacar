import Link from "next/link";
import { Home, Search, Mail, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5">
      <div className="max-w-md w-full px-5 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="font-heading text-headline-lg text-primary mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan. Mungkin link-nya salah
          atau halaman sudah dipindahkan.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="text-label-md text-on-surface-variant">
            Atau coba halaman berikut:
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-outline-variant/30 text-body-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Search className="h-4 w-4 text-primary" />
              Cari Template
            </Link>
            <Link
              href="/kebijakan-privasi"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-outline-variant/30 text-body-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Mail className="h-4 w-4 text-primary" />
              Hubungi Kami
            </Link>
          </div>

          <p className="text-label-md text-on-surface-variant mt-8">
            Atau kirim email ke <a href="mailto:hello@ucapanpacar.com" className="text-primary hover:underline">hello@ucapanpacar.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}