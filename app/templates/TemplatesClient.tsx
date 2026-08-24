"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getActiveTemplates, templateEmoji } from "@/lib/templates";
import { CATEGORY_META } from "@/lib/types";
import { AnalyticsEvents } from "@/lib/analytics";

export default function TemplatesClient({
  filtered,
  templates,
  kategori,
}: {
  filtered: ReturnType<typeof import("@/lib/templates").getActiveTemplates>;
  templates: ReturnType<typeof import("@/lib/templates").getActiveTemplates>;
  kategori: string | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCats = Object.values(CATEGORY_META).filter((c) => c.active);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface-container-high rounded-xl w-3/4 mx-auto" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card border border-outline-variant/20 animate-pulse">
              <div className="h-48 bg-gradient-to-br from-surface-container-low to-surface-container" />
              <div className="p-6">
                <div className="h-6 bg-surface-container-high rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface-container-high rounded w-1/2 mb-2" />
                <div className="h-4 bg-surface-container-high rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  const searchParams = useSearchParams();
  const currentKategori = searchParams.get("kategori");
  const filteredTemplates = currentKategori
    ? templates.filter(
        (t) =>
          CATEGORY_META[t.type].label.toLowerCase().replace(" ", "-") === currentKategori
      )
    : templates;

  return (
    <>
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          Belum ada template di kategori ini. Coba kategori lain ya!
        </div>
      ) : (
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((t) => (
            <Link
              key={t.slug}
              href={`/buat/${t.slug}`}
              onClick={() => AnalyticsEvents.templateSelected(t.slug)}
              className="group bg-white rounded-3xl overflow-hidden shadow-card border border-outline-variant/20 hover:-translate-y-1.5 hover:shadow-card-hover transition-all duration-300"
            >
              <div
                className={`relative h-48 bg-gradient-to-br ${t.gradient} flex items-center justify-center`}
              >
                <span className="text-8xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {templateEmoji(t.slug)}
                </span>
                <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-label-md font-semibold text-on-surface-variant">
                  {CATEGORY_META[t.type].emoji} {CATEGORY_META[t.type].label}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-heading text-xl text-on-surface mb-1.5">
                  {t.name}
                </h2>
                <p className="text-body-md text-on-surface-variant mb-4 min-h-[40px]">
                  {t.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary">
                    Buat Sekarang <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="text-label-md font-semibold bg-primary-fixed/30 text-primary px-3 py-1 rounded-full">
                    Rp 8.900
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}