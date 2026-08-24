import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getActiveTemplates, templateEmoji } from "@/lib/templates";
import { CATEGORY_META } from "@/lib/types";
import TemplatesClient from "./TemplatesClient";

export const metadata: Metadata = {
  title: "Pilih Template",
  description:
    "Jelajahi semua template ucapan romantis. Pilih template favoritmu dan buat kejutan spesial sekarang.",
};

export const dynamic = "force-dynamic";

async function getTemplatesData() {
  return {
    activeCats: Object.values(CATEGORY_META).filter((c) => c.active),
    templates: getActiveTemplates(),
  };
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const kategoriParam = kategori || null;
  const activeCats = Object.values(CATEGORY_META).filter((c) => c.active);
  const templates = getActiveTemplates();
  const filtered = kategoriParam
    ? templates.filter(
        (t) =>
          CATEGORY_META[t.type].label.toLowerCase().replace(" ", "-") === kategoriParam
      )
    : templates;

  return (
    <section className="w-full relative bg-surface min-h-screen">
      <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto pt-[120px] pb-20">
        <div className="text-center mb-10">
          <h1 className="font-heading text-headline-lg text-primary mb-4">
            Pilih Template untuk Momen Kalian
          </h1>
          <p className="text-body-lg font-medium text-on-surface-variant max-w-2xl mx-auto">
            Setiap template punya kesan yang berbeda. Pilih yang paling cocok,
            lalu isi dengan cerita kalian sendiri.
          </p>
        </div>

        <div className="flex justify-center gap-2 md:gap-3 mb-10 flex-wrap">
          <Link
            href="/templates"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-all ${
              !kategoriParam
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span>✨</span> Semua
          </Link>
          {Object.values(CATEGORY_META)
            .filter((c) => c.active)
            .map((cat) => {
              return (
                <Link
                  key={cat.label}
                  href={`/templates?kategori=${cat.label.toLowerCase().replace(" ", "-")}`}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-all ${
                    kategoriParam === cat.label.toLowerCase().replace(" ", "-")
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            Belum ada template di kategori ini. Coba kategori lain ya!
          </div>
        ) : (
          <TemplatesClient
            filtered={filtered}
            templates={templates}
            kategori={kategoriParam}
          />
        )}
      </div>
    </section>
  );
}