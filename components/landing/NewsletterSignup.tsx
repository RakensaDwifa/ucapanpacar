"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Format email tidak valid");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error("Gagal mendaftar. Coba lagi ya.");
        setStatus("idle");
        return;
      }
      setStatus("done");
      toast.success("Terima kasih! Tips & template spesial akan dikirim ke emailmu 💝");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi ya.");
      setStatus("idle");
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-label-lg font-semibold text-on-surface mb-2 flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" /> Dapatkan tips & template spesial
      </p>
      {status === "done" ? (
        <p className="text-body-md text-green-600 font-semibold">
          ✅ Berhasil! Cek inbox kamu nanti ya.
        </p>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email kamu…"
            aria-label="Email newsletter"
            className="flex-1 min-w-0 rounded-full border border-outline-variant bg-white px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-label-md font-semibold shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Daftar"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
