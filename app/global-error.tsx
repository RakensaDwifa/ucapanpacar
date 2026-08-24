"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <head>
        <title>Error - UcapanPacar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex items-center justify-center bg-surface px-5">
        <div className="max-w-md w-full px-5 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c.867 0 1.542-.766 1.542-1.705V7.015A1.992 1.992 0 0015.491 5H8.509a1.992 1.992 0 00-1.542 1.705v7.976c0 .735.678 1.705 1.543 1.705H21.54a2 2 0 011.991 1.998v.012a2 2 0 01-1.991 1.998H3.46a2 2 0 01-1.991-1.998v-.012a2 2 0 00-1.992-1.998H.05A2.001 2.001 0 010 10.015V5.015a2 2 0 011.992-1.998h15.896a2 2 0 011.991 1.998v.012a2 2 0 01-1.991 1.998z"
              />
            </svg>
          </div>
          <h1 className="font-heading text-headline-md text-primary mb-2">
            Terjadi Kesalahan Server
          </h1>
          <p className="text-body-md text-on-surface-variant mb-6 text-center max-w-md mx-auto">
            Maaf, terjadi kesalahan pada server. Tim teknis kami sudah diberitahu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Coba Lagi
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full text-label-lg font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}