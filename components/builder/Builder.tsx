"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  Music,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { getTemplate, fillContentDefaults } from "@/lib/templates";
import type { UcapanContent } from "@/lib/types";
import { getDraft, getUcapan, saveDraft, savePaidUcapan } from "@/lib/store";
import { makeUcapanId } from "@/lib/templates";
import { createClient } from "@/lib/supabase/client";
import { isRemote, supabaseUrl } from "@/lib/supabase/config";
import { compressImage } from "@/lib/image";
import TemplateRenderer from "@/components/templates/registry";

const STEPS = ["Identitas", "Pesan", "Galeri & Musik", "Bayar"];

export default function BuilderPage({ slug, editId }: { slug: string; editId?: string }) {
  const template = getTemplate(slug);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [content, setContent] = useState<Partial<UcapanContent>>(() => {
    if (editId) {
      const existing = getUcapan(editId);
      if (existing) {
        return fillContentDefaults({
          templateSlug: existing.templateSlug,
          toName: existing.toName,
          fromName: existing.fromName,
          title: existing.title,
          message: existing.message,
          photos: existing.photos,
          musicUrl: existing.musicUrl,
        });
      }
    }
    return fillContentDefaults(getDraft(slug) ?? { templateSlug: slug });
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!template) return;
    saveDraft(slug, content);
  }, [content, slug, template]);

  useEffect(() => {
    if (!editId || !isRemote()) return;
    let cancelled = false;
    fetch(`/api/ucapan/${editId}`)
      .then(async (r) => {
        const json = await r.json();
        if (!cancelled && json.ok && json.ucapan) {
          setContent(fillContentDefaults(json.ucapan));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const previewContent = useMemo(() => fillContentDefaults(content), [content]);

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-5 text-center">
        <p className="text-headline-md text-on-surface mb-3">Template tidak ditemukan</p>
        <a href="/templates" className="text-primary font-semibold">
          Kembali ke daftar template
        </a>
      </div>
    );
  }

  const canNext = step === 0 ? Boolean(content.toName?.trim()) : step === 1 ? Boolean(content.message?.trim()) : true;

  const set = <K extends keyof UcapanContent>(key: K, value: UcapanContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setSaveError("");
    try {
      const supabase = createClient();
      for (const file of Array.from(files)) {
        const blob = await compressImage(file);
        const ext = blob.type === "image/webp" ? "webp" : "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("foto")
          .upload(path, blob, { contentType: blob.type });
        if (error) throw error;
        const url = `${supabaseUrl()}/storage/v1/object/public/foto/${path}`;
        set("photos", [...(content.photos ?? []), url]);
      }
    } catch {
      setSaveError("Gagal mengunggah foto. Coba lagi ya.");
    } finally {
      setUploading(false);
    }
  };

  const goToPayment = async () => {
    setSaving(true);
    setSaveError("");
    try {
      if (isRemote()) {
        const full = fillContentDefaults(content);
        const res = await fetch(
          editId ? `/api/ucapan/${editId}` : "/api/ucapan",
          {
            method: editId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(full),
          }
        );
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/buat/${slug}${editId ? `?edit=${editId}` : ""}`)}`);
          return;
        }
        const json = await res.json();
        if (!json.ok) {
          setSaveError(
            json.error === "EDIT_WINDOW_EXPIRED"
              ? "Masa edit 7 hari sudah habis."
              : "Gagal menyimpan ucapan. Coba lagi ya."
          );
          return;
        }
        saveDraft(slug, content);
        router.push(`/checkout/${json.id ?? editId}`);
      } else {
        const id = editId ?? makeUcapanId();
        savePaidUcapan({
          ...fillContentDefaults(content),
          id,
          paid: editId ? Boolean(getUcapan(id)?.paid) : false,
          paidAt: editId ? getUcapan(id)?.paidAt : undefined,
          createdAt: editId ? getUcapan(id)?.createdAt ?? Date.now() : Date.now(),
        });
        router.push(`/checkout/${id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-10">
        <a
          href="/templates"
          className="inline-flex items-center gap-1.5 text-body-md font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </a>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-headline-md text-primary">
            Buat Ucapan — {template.name}
          </h1>
          <span className="text-label-lg font-bold text-primary bg-primary-fixed/40 px-4 py-1.5 rounded-full">
            Rp 8.900
          </span>
        </div>

        {/* progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-label-md font-semibold transition-all ${
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                      ? "bg-primary-fixed/50 text-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    i < step ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-title-lg text-on-surface">Siapa untuk siapa?</h2>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Nama Pacar Kamu *
                  </label>
                  <input
                    className={inputClass}
                    placeholder="cth: Nabila"
                    value={content.toName ?? ""}
                    onChange={(e) => set("toName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Nama Kamu
                  </label>
                  <input
                    className={inputClass}
                    placeholder="cth: Raka"
                    value={content.fromName ?? ""}
                    onChange={(e) => set("fromName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Judul Surat
                  </label>
                  <input
                    className={inputClass}
                    placeholder="cth: Untuk Kamu"
                    value={content.title ?? ""}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-title-lg text-on-surface">Tulis pesanmu 💌</h2>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Isi Pesan *
                  </label>
                  <textarea
                    className={`${inputClass} min-h-56 resize-y`}
                    placeholder="Ceritakan perasaanmu…"
                    value={content.message ?? ""}
                    onChange={(e) => set("message", e.target.value)}
                  />
                  <p className="text-label-md text-on-surface-variant mt-1.5">
                    {content.message?.length ?? 0} karakter
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading text-title-lg text-on-surface">
                  Galeri kenangan & musik
                </h2>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Foto Kenangan
                  </label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low/50 px-4 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary-fixed/10 transition-colors">
                    <ImagePlus className="h-8 w-8 text-primary" />
                    <span className="text-body-md font-semibold text-on-surface">
                      {uploading ? "Mengunggah…" : "Pilih Foto dari Galeri / Kamera"}
                    </span>
                    <span className="text-label-md text-on-surface-variant">
                      Otomatis dikompres & diunggah · maks 10MB/foto
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        void uploadPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {(content.photos ?? []).length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {(content.photos ?? []).map((photo, i) => (
                        <div
                          key={`${photo}-${i}`}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-low"
                        >
                          <img
                            src={photo}
                            alt={`Foto ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() =>
                              set("photos", (content.photos ?? []).filter((_, j) => j !== i))
                            }
                            aria-label="Hapus foto"
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-label-md font-semibold text-primary">
                      atau tempel URL gambar
                    </summary>
                    <div className="flex flex-col gap-2 mt-2">
                      {(content.photos ?? []).map((photo, i) => (
                        <div key={`url-${i}`} className="flex items-center gap-2">
                          <input
                            className={inputClass}
                            value={photo}
                            onChange={(e) => {
                              const photos = [...(content.photos ?? [])];
                              photos[i] = e.target.value;
                              set("photos", photos);
                            }}
                          />
                          <button
                            onClick={() =>
                              set("photos", (content.photos ?? []).filter((_, j) => j !== i))
                            }
                            aria-label="Hapus foto"
                            className="p-2.5 rounded-full text-on-surface-variant hover:text-primary transition-colors shrink-0"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => set("photos", [...(content.photos ?? []), ""])}
                        className="inline-flex items-center gap-2 self-start text-label-lg font-semibold text-primary hover:bg-primary-fixed/30 rounded-full px-4 py-2 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Tambah URL
                      </button>
                    </div>
                  </details>
                </div>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Musik Latar (URL MP3)
                  </label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <input
                      className={`${inputClass} pl-11`}
                      placeholder="https://…/lagu.mp3"
                      value={content.musicUrl ?? ""}
                      onChange={(e) => set("musicUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-title-lg text-on-surface">Siap kirim kejutan?</h2>
                <div className="rounded-2xl bg-surface-container-low p-5 space-y-3">
                  {[
                    ["Template", template.name],
                    ["Untuk", content.toName || "—"],
                    ["Dari", content.fromName || "—"],
                    ["Judul", content.title || "—"],
                    ["Pesan", `${content.message?.length ?? 0} karakter`],
                    ["Foto", `${content.photos?.filter(Boolean).length ?? 0} foto`],
                    ["Harga", "Rp 8.900 (sekali bayar)"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-body-md text-on-surface-variant">{label}</span>
                      <span className="text-body-md font-semibold text-on-surface text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                {saveError && (
                  <p className="text-body-md text-red-600">{saveError}</p>
                )}
                <p className="text-label-md text-on-surface-variant leading-relaxed">
                  ✅ Link aktif selamanya · ✅ Edit 7 hari setelah bayar · ✅ Bisa dibagikan via
                  link & QR · ✅ Jejak kunjungan real-time
                </p>
                <button
                  onClick={() => void goToPayment()}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white text-label-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(217,108,138,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Menyimpan…
                    </>
                  ) : (
                    <>
                      <Upload className="hidden" />
                      Lanjut ke Pembayaran — Rp 8.900
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/30">
              <button
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-label-lg font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Sebelumnya
              </button>
              {step < STEPS.length - 1 && (
                <button
                  onClick={next}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1.5 px-8 py-3 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Lanjut <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="lg:sticky lg:top-24 self-start">
            <p className="text-label-lg font-semibold text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Preview
            </p>
            <motion.div
              key={step}
              initial={{ opacity: 0.6, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl overflow-hidden border-4 border-white shadow-[0_20px_60px_rgba(217,108,138,0.2)]"
            >
              <div className="h-[560px] overflow-y-auto bg-surface">
                <TemplateRenderer content={previewContent} preview />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
