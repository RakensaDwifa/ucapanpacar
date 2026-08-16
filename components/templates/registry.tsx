"use client";

import { lazy, Suspense } from "react";
import type { TemplateRenderProps } from "@/lib/types";

const AmplopCinta = lazy(() => import("./AmplopCinta"));
const BotolKenangan = lazy(() => import("./BotolKenangan"));
const BuketBunga = lazy(() => import("./BuketBunga"));
const SuratCinta = lazy(() => import("./SuratCinta"));
const KartuUcapan = lazy(() => import("./KartuUcapan"));
const Valentine = lazy(() => import("./Valentine"));
const PermintaanMaaf = lazy(() => import("./PermintaanMaaf"));

const REGISTRY: Record<string, React.ComponentType<TemplateRenderProps>> = {
  "amplop-cinta": AmplopCinta,
  "botol-kenangan": BotolKenangan,
  "buket-bunga": BuketBunga,
  "surat-cinta": SuratCinta,
  "kartu-ucapan": KartuUcapan,
  valentine: Valentine,
  "permintaan-maaf": PermintaanMaaf,
};

function TemplateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
    </div>
  );
}

export default function TemplateRenderer(props: TemplateRenderProps) {
  const Component = REGISTRY[props.content.templateSlug];
  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        Template tidak ditemukan.
      </div>
    );
  }
  return (
    <Suspense fallback={<TemplateLoading />}>
      <Component {...props} />
    </Suspense>
  );
}
