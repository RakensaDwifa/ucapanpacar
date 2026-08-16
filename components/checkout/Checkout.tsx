"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2, Lock, Wallet } from "lucide-react";
import { getUcapan } from "@/lib/store";
import type { StoredUcapan } from "@/lib/store";

interface Channel {
  group: string;
  code: string;
  name: string;
  type: string;
}

export default function Checkout({ id }: { id: string }) {
  const router = useRouter();
  const [ucapan, setUcapan] = useState<StoredUcapan | null>(null);
  const [loadingUcapan, setLoadingUcapan] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [method, setMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ucapan/${id}`)
      .then(async (r) => {
        const json = await r.json();
        if (cancelled) return;
        if (json.ucapan) {
          setUcapan(json.ucapan);
        } else {
          setUcapan(getUcapan(id));
        }
      })
      .catch(() => {
        if (!cancelled) setUcapan(getUcapan(id));
      })
      .finally(() => {
        if (!cancelled) setLoadingUcapan(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    fetch("/api/payment/channels")
      .then((r) => r.json())
      .then((json: { demo: boolean; channels: Channel[] }) => {
        setDemoMode(json.demo);
        setChannels(json.channels);
        if (json.channels.length > 0) setMethod(json.channels[0].code);
      })
      .catch(() => setDemoMode(true));
  }, [id]);

  if (loadingUcapan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!ucapan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-5 text-center">
        <p className="text-headline-md text-on-surface mb-3">Data ucapan tidak ditemukan</p>
        <a href="/templates" className="text-primary font-semibold">
          Mulai dari awal
        </a>
      </div>
    );
  }

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 900));
        router.push(`/checkout/${id}/selesai?demo=1`);
        return;
      }
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ucapanId: id,
          method,
          customerName: ucapan.fromName || "Pelanggan",
        }),
      }).then((r) => r.json());
      if (res.ok && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setError("Gagal membuat transaksi. Coba lagi ya.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-lg mx-auto px-5 py-10">
        <a
          href={`/buat/${ucapan.templateSlug}`}
          className="inline-flex items-center gap-1.5 text-body-md font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali edit
        </a>

        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed/40 flex items-center justify-center text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-title-lg text-on-surface">Pembayaran</h1>
              <p className="text-body-md text-on-surface-variant">
                Template {ucapan.templateSlug}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-5 flex items-center justify-between mb-6">
            <span className="text-body-md font-medium text-on-surface-variant">Total</span>
            <span className="text-headline-md font-bold text-primary">Rp 8.900</span>
          </div>

          {demoMode ? (
            <div className="rounded-2xl border border-primary/20 bg-primary-fixed/20 p-5 mb-6 space-y-2">
              <p className="text-label-lg font-semibold text-primary">
                🧪 Mode Demo Aktif
              </p>
              <p className="text-body-md text-on-surface-variant">
                Konfigurasi API Tripay belum ada, jadi pembayaran akan disimulasikan.
                Setelah ini ucapan langsung aktif — cocok untuk uji coba alur.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-label-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Pilih Metode Pembayaran
              </p>
              {channels.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">
                  Memuat metode pembayaran…
                </p>
              ) : (
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {channels.map((c) => (
                    <label
                      key={c.code}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                        method === c.code
                          ? "border-primary bg-primary-fixed/20"
                          : "border-outline-variant hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={c.code}
                        checked={method === c.code}
                        onChange={() => setMethod(c.code)}
                        className="accent-primary"
                      />
                      <span className="text-body-md font-semibold text-on-surface">{c.name}</span>
                      <span className="ml-auto text-label-md text-on-surface-variant">{c.group}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-body-md text-red-600 mb-4 text-center">{error}</p>
          )}

          <button
            onClick={() => void pay()}
            disabled={loading || (!demoMode && !method)}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white text-label-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(217,108,138,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Memproses…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                {demoMode ? "Aktifkan Sekarang (Demo)" : `Bayar Rp 8.900`}
              </>
            )}
          </button>
          <p className="text-label-md text-on-surface-variant text-center mt-4 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Pembayaran aman & proses instan
          </p>
        </div>
      </div>
    </div>
  );
}
