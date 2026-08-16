"use client";

import { useEffect, useState } from "react";
import { getUcapan, trackView } from "@/lib/store";
import type { StoredUcapan } from "@/lib/store";
import TemplateRenderer from "@/components/templates/registry";

export default function PublicView({
  id,
  remote,
}: {
  id: string;
  remote?: StoredUcapan | null;
}) {
  const [ucapan] = useState<StoredUcapan | null>(() => remote ?? getUcapan(id));

  useEffect(() => {
    if (!ucapan) return;
    trackView(id);
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ucapanId: id }),
    }).catch(() => undefined);
  }, [id, ucapan]);

  if (!ucapan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-5 text-center">
        <p className="text-headline-md text-on-surface mb-3">Ucapan tidak ditemukan</p>
        <p className="text-body-md text-on-surface-variant mb-6">
          Mungkin belum dibuat, atau link-nya salah.
        </p>
        <a
          href="/templates"
          className="px-8 py-3 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md"
        >
          Buat Ucapanmu Sendiri
        </a>
      </div>
    );
  }

  return <TemplateRenderer content={ucapan} />;
}
