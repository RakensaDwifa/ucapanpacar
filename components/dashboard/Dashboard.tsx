"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  ExternalLink,
  Eye,
  Heart,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { deleteUcapan, getViews, listUcapan } from "@/lib/store";
import type { StoredUcapan, ViewRecord } from "@/lib/store";

const EDIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface RemoteUcapan extends StoredUcapan {
  views?: { count: number; firstSeen?: number; lastSeen?: number };
}

export default function Dashboard() {
  const [ucapans, setUcapans] = useState<RemoteUcapan[]>([]);
  const [demo, setDemo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [localViews, setLocalViews] = useState<Record<string, ViewRecord>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openQr, setOpenQr] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/ucapan")
      .then(async (r) => {
        const json = await r.json();
        if (json.demo) {
          setDemo(true);
          setUcapans(listUcapan());
          const v: Record<string, ViewRecord> = {};
          for (const u of listUcapan()) {
            const rec = getViews(u.id);
            if (rec) v[u.id] = rec;
          }
          setLocalViews(v);
        } else if (json.ok) {
          setDemo(false);
          setUcapans(json.ucapans ?? []);
        }
      })
      .catch(() => {
        setDemo(true);
        setUcapans(listUcapan());
      })
      .finally(() => setLoaded(true));
  }, []);

  const remove = async (id: string) => {
    if (demo) {
      deleteUcapan(id);
      setUcapans(listUcapan());
      setLocalViews((v) => {
        const next = { ...v };
        delete next[id];
        return next;
      });
      return;
    }
    await fetch(`/api/ucapan/${id}`, { method: "DELETE" });
    setUcapans((list) => list.filter((u) => u.id !== id));
  };

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/t/${id.slice(0, 8)}/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // abaikan
    }
  };

  const viewOf = (u: RemoteUcapan) =>
    demo ? localViews[u.id] : u.views ?? undefined;

  if (!loaded) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-16">
        <div className="max-w-[1100px] mx-auto px-5 md:px-16">
          <p className="text-body-md text-on-surface-variant">Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-[1100px] mx-auto px-5 md:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-headline-lg text-primary mb-1">Dashboard</h1>
            <p className="text-body-md text-on-surface-variant">
              Kelola ucapanmu, pantau kunjungan, dan bagikan kejutanmu.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <Heart className="h-4 w-4 fill-current" /> Buat Ucapan Baru
          </Link>
        </div>

        {demo && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
            <p className="text-body-md text-amber-800">
              🧪 Mode demo — data disimpan di browser ini saja. Sambungkan
              Supabase agar dashboard tersinkron di semua perangkat.
            </p>
          </div>
        )}

        {ucapans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-fixed/30 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-title-lg text-on-surface mb-2">
              Belum ada ucapan
            </h2>
            <p className="text-body-md text-on-surface-variant mb-6 max-w-sm mx-auto">
              Buat kejutan pertama untuk orang tersayang — cuma butuh 5 menit.
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md"
            >
              Pilih Template
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {ucapans.map((u) => {
              const view = viewOf(u);
              const editOpen =
                now - (u.paidAt ?? u.createdAt) < EDIT_WINDOW_MS;
              const qr = openQr === u.id;
              const url = `${window.location.origin}/t/${u.id.slice(0, 8)}/${u.id}`;
              return (
                <div
                  key={u.id}
                  className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-heading text-title-lg text-on-surface">
                          {u.title || "Untuk Kamu"}
                        </h2>
                        <span
                          className={`text-label-md font-semibold px-3 py-1 rounded-full ${
                            u.paid
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {u.paid ? "Aktif" : "Menunggu pembayaran"}
                        </span>
                      </div>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Untuk {u.toName} · dari {u.fromName} · {u.templateSlug}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-body-md text-on-surface-variant">
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-primary" />
                          {view ? `${view.count}× dilihat` : "Belum dilihat"}
                        </span>
                        {view?.firstSeen && (
                          <span>
                            Pertama dibuka{" "}
                            {new Date(view.firstSeen).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => copyLink(u.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-label-md font-semibold bg-primary text-white shadow-sm hover:-translate-y-0.5 transition-all"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedId === u.id ? "Tersalin!" : "Salin Link"}
                      </button>
                      <button
                        onClick={() => setOpenQr(qr ? null : u.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-label-md font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                      >
                        QR
                      </button>
                      {u.paid && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Buka ucapan"
                          className="p-2.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/buat/${u.templateSlug}?edit=${u.id}`}
                        aria-label="Edit ucapan"
                        className={`p-2.5 rounded-full transition-colors ${
                          editOpen
                            ? "bg-surface-container-low text-on-surface hover:bg-surface-container"
                            : "bg-surface-container-low/50 text-on-surface-variant/50 cursor-not-allowed pointer-events-none"
                        }`}
                        title={editOpen ? "Edit ucapan" : "Masa edit 7 hari sudah habis"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => remove(u.id)}
                        aria-label="Hapus ucapan"
                        className="p-2.5 rounded-full bg-surface-container-low text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {qr && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center gap-6">
                      <QRCodeSVG value={url} size={140} fgColor="#22191a" />
                      <div>
                        <p className="text-label-lg font-semibold text-on-surface mb-1">
                          Scan QR untuk membuka
                        </p>
                        <p className="text-body-md text-on-surface-variant break-all">
                          {url}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
