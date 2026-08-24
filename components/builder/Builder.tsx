"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudUpload,
  ImagePlus,
  Loader2,
  Music,
  Plus,
  Redo2,
  Undo2,
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
import { toast } from "sonner";
import {
  saveDraftRemote,
  getDraftRemote,
  clearDraftRemote,
  markLocalSaved,
  getLocalSavedAt,
} from "@/lib/drafts";
import type { SyncStatus } from "@/lib/drafts";
import { useContentHistory } from "@/lib/history";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import ShortcutsHelpModal from "@/components/ui/shortcuts-help";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

const STEPS = ["Identitas", "Pesan", "Galeri & Musik", "Bayar"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("up_preview_mode");
      if (stored === "mobile" || stored === "desktop") setPreviewMode(stored);
    } catch {
      // ignore
    }
  }, []);

  const switchPreviewMode = useCallback((mode: "mobile" | "desktop") => {
    setPreviewMode(mode);
    try {
      window.localStorage.setItem("up_preview_mode", mode);
    } catch {
      // ignore
    }
  }, []);

  const remoteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!template) return;
    saveDraft(slug, content);
    markLocalSaved(slug);

    if (!isRemote()) return;
    setSyncStatus("saving");
    if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
    remoteSaveTimer.current = setTimeout(async () => {
      const result = await saveDraftRemote(content);
      setSyncStatus(
        result === "ok" ? "saved" : result === "skipped" ? "idle" : "error"
      );
    }, 3000);
    return () => {
      if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
    };
  }, [content, slug, template]);

  // Restore draft remote saat pertama kali buka builder (bukan mode edit)
  useEffect(() => {
    if (!isRemote() || editId) return;
    let cancelled = false;
    void (async () => {
      try {
        const [remote, localAt] = await Promise.all([
          getDraftRemote(slug),
          Promise.resolve(getLocalSavedAt(slug)),
        ]);
        if (cancelled || !remote) return;
        // Hanya pakai remote jika lebih baru dari lokal
        if (remote.updatedAt > localAt) {
          setContent((c) => fillContentDefaults({ ...remote.content, ...c, templateSlug: slug }));
          markRestored();
          toast.info("Draft tersinkron dari perangkat lain dipulihkan");
        }
      } catch {
        // silent — fallback ke draft lokal
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!editId || !isRemote()) return;
    let cancelled = false;
    fetch(`/api/ucapan/${editId}`)
      .then(async (r) => {
        const json = await r.json();
        if (!cancelled && json.ok && json.ucapan) {
          setContent(fillContentDefaults(json.ucapan));
          markRestored();
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const previewContent = useMemo(() => fillContentDefaults(content), [content]);

  const applyContent = useCallback(
    (next: Partial<UcapanContent>) => setContent(next),
    []
  );
  const { canUndo, canRedo, undo, redo, markRestored } =
    useContentHistory<Partial<UcapanContent>>(content, applyContent);

  // Ref ke aksi builder — diisi setelah fungsi-fungsi didefinisikan (di bawah).
  const actionsRef = useRef<{
    undo: () => void;
    redo: () => void;
    next: () => void;
    prev: () => void;
    save: () => void;
    gotoStep: (i: number) => void;
  }>({
    undo: () => {},
    redo: () => {},
    next: () => {},
    prev: () => {},
    save: () => {},
    gotoStep: () => {},
  });

  useKeyboardShortcuts(
    {
      "ctrl+z": () => actionsRef.current.undo(),
      "ctrl+shift+z": () => actionsRef.current.redo(),
      "ctrl+y": () => actionsRef.current.redo(),
      "ctrl+s": () => actionsRef.current.save(),
      "ctrl+enter": () => actionsRef.current.next(),
      escape: () => actionsRef.current.prev(),
      "alt+1": () => actionsRef.current.gotoStep(0),
      "alt+2": () => actionsRef.current.gotoStep(1),
      "alt+3": () => actionsRef.current.gotoStep(2),
      "alt+4": () => actionsRef.current.gotoStep(3),
      "?": () => setShowShortcuts(true),
      "shift+?": () => setShowShortcuts(true),
    }
  );

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

  const isValidEmail = useCallback((email: string) => EMAIL_REGEX.test(email.trim()), []);

  const canNext = step === 0
    ? Boolean(content.toName?.trim() && content.email?.trim() && isValidEmail(content.email))
    : step === 1
      ? Boolean(content.message?.trim())
      : true;

  const set = <K extends keyof UcapanContent>(key: K, value: UcapanContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const next = () => {
    AnalyticsEvents.builderStepCompleted(step, slug);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => {
    AnalyticsEvents.builderStepCompleted(step, slug);
    setStep((s) => Math.max(s - 1, 0));
  };

  actionsRef.current.undo = undo;
  actionsRef.current.redo = redo;
  actionsRef.current.next = () => {
    if (!canNext) return;
    next();
  };
  actionsRef.current.prev = prev;
  // Lompat langkah hanya ke belakang (konsisten dengan progress pills)
  actionsRef.current.gotoStep = (i: number) => {
    if (i >= 0 && i < STEPS.length && i < step) setStep(i);
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
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
      toast.success("Foto berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah foto. Coba lagi ya.");
    } finally {
      setUploading(false);
    }
  };

  const goToPayment = async () => {
    AnalyticsEvents.paymentStarted(slug, 8900);
    setSaving(true);
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
          toast.error(
            json.error === "EDIT_WINDOW_EXPIRED"
              ? "Masa edit 7 hari sudah habis."
              : "Gagal menyimpan ucapan. Coba lagi ya."
          );
          return;
        }
        saveDraft(slug, content);
        void clearDraftRemote(slug);
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
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi ya.");
    } finally {
      setSaving(false);
    }
  };

  actionsRef.current.save = () => {
    if (!saving) void goToPayment();
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
          <div className="flex items-center gap-3">
            {isRemote() && (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-label-md font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  syncStatus === "saving"
                    ? "text-on-surface-variant bg-surface-container-low"
                    : syncStatus === "saved"
                      ? "text-green-700 bg-green-50"
                      : syncStatus === "error"
                        ? "text-red-600 bg-red-50"
                        : ""
                }`}
                role="status"
                aria-live="polite"
              >
                {syncStatus === "saving" && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan…
                  </>
                )}
                {syncStatus === "saved" && (
                  <>
                    <CloudUpload className="h-3.5 w-3.5" /> Tersimpan otomatis
                  </>
                )}
                {syncStatus === "error" && <>⚠️ Sinkron gagal</>}
              </span>
            )}
            <span className="text-label-lg font-bold text-primary bg-primary-fixed/40 px-4 py-1.5 rounded-full">
              Rp 8.900
            </span>
          </div>
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

        {/* undo/redo toolbar */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
            className="p-2.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40 disabled:hover:bg-surface-container-low"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
            className="p-2.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40 disabled:hover:bg-surface-container-low"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className="px-3 py-2.5 rounded-full bg-surface-container-low text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            ⌨️ Shortcuts
          </button>
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
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Email Kamu (untuk notifikasi) *
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="cth: kamu@gmail.com"
                    value={content.email ?? ""}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={(e) => {
                      const email = e.target.value;
                      if (email && !isValidEmail(email)) {
                        toast.error("Format email tidak valid");
                      }
                    }}
                    required
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

                <div className="border-t border-outline-variant/30 pt-6">
                  <label className="block text-label-lg font-semibold text-on-surface mb-1">
                    Timeline / Momen Penting (Opsional)
                  </label>
                  <p className="text-body-md text-on-surface-variant mb-4">
                    Tambahkan tanggal dan momen spesial kalian (misal: Kencan Pertama, Jadian).
                  </p>
                  <div className="space-y-3">
                    {(content.timeline ?? []).map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-label-md font-bold text-primary">Momen #{i + 1}</span>
                          <button
                            onClick={() => {
                              const t = [...(content.timeline ?? [])];
                              t.splice(i, 1);
                              set("timeline", t);
                            }}
                            className="text-red-500 hover:text-red-700 text-label-md font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            className={inputClass}
                            placeholder="Tanggal (cth: 14 Feb 2024)"
                            value={item.date}
                            onChange={(e) => {
                              const t = [...(content.timeline ?? [])];
                              t[i] = { ...t[i], date: e.target.value };
                              set("timeline", t);
                            }}
                          />
                          <input
                            className={inputClass}
                            placeholder="Judul Momen (cth: Kencan Pertama)"
                            value={item.title}
                            onChange={(e) => {
                              const t = [...(content.timeline ?? [])];
                              t[i] = { ...t[i], title: e.target.value };
                              set("timeline", t);
                            }}
                          />
                        </div>
                        <input
                          className={inputClass}
                          placeholder="Deskripsi singkat (opsional)"
                          value={item.description ?? ""}
                          onChange={(e) => {
                            const t = [...(content.timeline ?? [])];
                            t[i] = { ...t[i], description: e.target.value };
                            set("timeline", t);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        set("timeline", [
                          ...(content.timeline ?? []),
                          { date: "", title: "", description: "" },
                        ])
                      }
                      className="inline-flex items-center gap-2 text-label-lg font-semibold text-primary hover:bg-primary-fixed/30 rounded-full px-4 py-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Tambah Momen Timeline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-title-lg text-on-surface">Siap kirim kejutan?</h2>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Email Kamu (untuk notifikasi)
                  </label>
                  <div className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface">
                    {content.email ?? "—"}
                  </div>
                  <p className="text-label-md text-on-surface-variant mt-1.5">
                    Digunakan untuk notifikasi link ucapan & konfirmasi pembayaran.
                  </p>
                </div>
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-lg font-semibold text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Preview
              </p>
              <div className="flex items-center rounded-full bg-surface-container-low p-1" role="group" aria-label="Mode preview">
                {(
                  [
                    { mode: "mobile" as const, icon: "📱", label: "Mobile" },
                    { mode: "desktop" as const, icon: "🖥️", label: "Desktop" },
                  ]
                ).map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => switchPreviewMode(mode)}
                    aria-pressed={previewMode === mode}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-semibold transition-all ${
                      previewMode === mode
                        ? "bg-white text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span aria-hidden>{icon}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <motion.div
              key={step}
              initial={{ opacity: 0.6, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl overflow-hidden border-4 border-white shadow-[0_20px_60px_rgba(217,108,138,0.2)] transition-[max-width] duration-300 ${
                previewMode === "mobile" ? "max-w-[375px] mx-auto" : "max-w-full"
              }`}
            >
              <div className="h-[560px] overflow-y-auto bg-surface">
                <TemplateRenderer content={previewContent} preview />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ShortcutsHelpModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
