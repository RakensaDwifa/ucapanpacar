"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, Users, Wallet } from "lucide-react";
import { AnalyticsEvents } from "@/lib/analytics";

interface Stats {
  invited: number;
  completed: number;
  earned: number;
}

export default function ReferralDashboard() {
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ invited: 0, completed: 0, earned: 0 });
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then(async (r) => {
        const json = await r.json();
        if (json.ok) {
          setCode(json.code);
          setStats(json.stats);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const link = code && typeof window !== "undefined" ? `${window.location.origin}/templates?ref=${code}` : "";

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-[900px] mx-auto px-5 md:px-16">
        <div className="mb-10">
          <h1 className="font-heading text-headline-lg text-primary mb-1">Program Referral</h1>
          <p className="text-body-md text-on-surface-variant">
            Ajak temanmu bikin kejutan — kamu dapat saldo Rp 5.000 untuk setiap teman yang menyelesaikan pembayaran.
          </p>
        </div>

        {!loaded ? (
          <p className="text-body-md text-on-surface-variant">Memuat…</p>
        ) : (
          <>
            {/* Kode & link */}
            <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 md:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-title-lg text-on-surface">Kode Referral Kamu</h2>
              </div>

              {code ? (
                <>
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-surface-container-low mb-4">
                    <span className="font-mono text-title-md font-bold tracking-wider text-primary">
                      {code}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        copyLink();
                        AnalyticsEvents.referralShared(code);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-label-lg font-semibold shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Tersalin!" : "Salin Link Referral"}
                    </button>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-surface-container-low text-on-surface text-label-lg font-semibold hover:bg-surface-container transition-colors"
                    >
                      Kembali ke Dashboard
                    </Link>
                  </div>
                  {link && (
                    <p className="text-label-md text-on-surface-variant mt-4 break-all">{link}</p>
                  )}
                </>
              ) : (
                <p className="text-body-md text-red-600">
                  Gagal memuat kode referral. Coba refresh halaman.
                </p>
              )}
            </div>

            {/* Statistik */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Users, label: "Teman Diundang", value: String(stats.invited) },
                { icon: Gift, label: "Berhasil Transaksi", value: String(stats.completed) },
                { icon: Wallet, label: "Total Saldo Didapat", value: `Rp ${stats.earned.toLocaleString("id-ID")}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 text-center">
                  <div className="w-11 h-11 rounded-full bg-primary-fixed/40 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-heading text-headline-md text-on-surface">{value}</p>
                  <p className="text-label-md text-on-surface-variant mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Cara kerja */}
            <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 md:p-8">
              <h2 className="font-heading text-title-lg text-on-surface mb-4">Cara Kerjanya</h2>
              <ol className="space-y-3 list-none">
                {[
                  "Bagikan link referral kamu ke teman-temanmu.",
                  "Teman mendaftar lewat link dan membuat ucapan pertamanya.",
                  "Setelah pembayaran temanmu berhasil, saldo Rp 5.000 otomatis masuk ke akunmu.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-label-lg font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-body-md text-on-surface-variant pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
