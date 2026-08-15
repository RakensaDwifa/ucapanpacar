"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Copy, ExternalLink, LayoutDashboard, Loader2 } from "lucide-react";
import { getUcapan, savePaidUcapan } from "@/lib/store";

function SuccessInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const hasPendingRef = Boolean(searchParams.get("ref"));
  const isDemo = searchParams.get("demo") === "1";
  const [state, setState] = useState<"checking" | "waiting" | "done">(() =>
    isDemo || hasPendingRef ? "checking" : "waiting"
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const demo = searchParams.get("demo");
    const ref = searchParams.get("ref");

    const finalize = () => {
      const u = getUcapan(id);
      if (u) {
        savePaidUcapan({ ...u, paid: true, paidAt: Date.now() });
        setState("done");
      }
    };

    if (demo === "1") {
      setTimeout(finalize, 0);
      return;
    }

    if (ref) {
      let cancelled = false;
      let attempts = 0;
      const poll = async () => {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(ref)}`).then(
          (r) => r.json()
        );
        if (cancelled) return;
        if (res.ok && res.status === "PAID") {
          finalize();
        } else {
          attempts += 1;
          if (attempts < 20) {
            setTimeout(poll, 3000);
          } else {
            setState("waiting");
          }
        }
      };
      poll();
      return () => {
        cancelled = true;
      };
    }
  }, [id, searchParams]);

  if (state === "checking" || state === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-5 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-headline-md text-on-surface mb-2">
          {state === "waiting"
            ? "Menunggu konfirmasi pembayaran…"
            : "Memeriksa status pembayaran…"}
        </p>
        <p className="text-body-md text-on-surface-variant max-w-sm">
          Halaman ini akan otomatis berubah setelah pembayaran terverifikasi. Jangan tutup
          tab ini ya.
        </p>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/t/${id.slice(0, 8)}/${id}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-lg mx-auto px-5 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-heading text-headline-lg text-primary mb-2">
          Pembayaran Berhasil! 🎉
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          Kejutanmu sudah aktif selamanya. Bagikan ke dia sekarang!
        </p>

        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 mb-6">
          <p className="text-label-lg font-semibold text-on-surface mb-1.5">Link Ucapan</p>
          <p className="text-body-md text-on-surface-variant break-all mb-4">{publicUrl}</p>
          <button
            onClick={copyLink}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <Copy className="h-4 w-4" /> {copied ? "Tersalin!" : "Salin Link"}
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 mb-6">
          <p className="text-label-lg font-semibold text-on-surface mb-4">Scan QR Code</p>
          <div className="mx-auto w-fit p-4 bg-white rounded-2xl border border-outline-variant/30">
            <QRCodeSVG value={publicUrl} size={180} fgColor="#22191a" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-container-low text-on-surface text-label-lg font-semibold rounded-full hover:bg-surface-container transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Buka Ucapan
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <LayoutDashboard className="h-4 w-4" /> Buka Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage({ id }: { id: string }) {
  return (
    <Suspense>
      <SuccessInner id={id} />
    </Suspense>
  );
}
