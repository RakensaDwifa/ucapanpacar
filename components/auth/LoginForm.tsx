"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginFormInner({ remote }: { remote: boolean }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !remote) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setErrorMsg("Gagal mengirim link. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-md mx-auto px-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body-md font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6 md:p-8">
          <h1 className="font-heading text-headline-lg text-primary mb-2">Masuk</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            Kelola ucapanmu, lihat siapa yang sudah membuka link, dan edit dalam
            masa aktif. Cukup masukkan email — link masuk tanpa password.
          </p>

          {!remote && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
              <p className="text-body-md text-amber-800">
                Mode demo aktif (Supabase belum terhubung). Login akan tersedia
                setelah konfigurasi lengkap.
              </p>
            </div>
          )}

          {error === "auth" && !sent && (
            <p className="text-body-md text-red-600 mb-4">
              Link masuk tidak valid atau sudah kedaluwarsa. Coba kirim ulang.
            </p>
          )}

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="font-heading text-title-lg text-on-surface mb-2">
                Cek email kamu 📬
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Link masuk sudah dikirim ke{" "}
                <span className="font-semibold">{email.trim()}</span>. Klik link
                di email untuk masuk ke dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  placeholder="kamu@email.com"
                  value={email}
                  disabled={!remote}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errorMsg && (
                <p className="text-body-md text-red-600">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={loading || !remote}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white text-label-lg font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Kirim Link Masuk
              </button>
              <p className="text-label-md text-on-surface-variant text-center">
                Tips: gunakan email yang sama saat membuat ucapan agar semua
                muncul di dashboard.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginForm({ remote }: { remote: boolean }) {
  return (
    <Suspense>
      <LoginFormInner remote={remote} />
    </Suspense>
  );
}
