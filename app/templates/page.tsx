import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveTemplates, templateEmoji } from "@/lib/templates";
import { CATEGORY_META } from "@/lib/types";

export const metadata = {
  title: "Pilih Template",
  description:
    "Jelajahi semua template ucapan romantis. Pilih template favoritmu dan buat kejutan spesial sekarang.",
};

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const activeCats = Object.values(CATEGORY_META).filter((c) => c.active);
  const templates = getActiveTemplates();
  const filtered = kategori
    ? templates.filter(
        (t) =>
          CATEGORY_META[t.type].label.toLowerCase().replace(" ", "-") === kategori
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
              !kategori
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span>✨</span> Semua
          </Link>
          {activeCats.map((cat) => (
            <Link
              key={cat.label}
              href={`/templates?kategori=${cat.label.toLowerCase().replace(" ", "-")}`}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-all ${
                kategori === cat.label.toLowerCase().replace(" ", "-")
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            Belum ada template di kategori ini. Coba kategori lain ya!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <Link
                key={t.slug}
                href={`/buat/${t.slug}`}
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
                  <h2 className="font-heading text-xl text-on-surface mb-1.5">{t.name}</h2>
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
      </div>
    </section>
  );
}
