"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isRemote } from "@/lib/supabase/config";

const REF_KEY = "up_ref_code";
const APPLIED_KEY = "up_ref_applied";

/**
 * Pasang sekali di layout: menangkap ?ref=CODE dari URL,
 * menyimpannya, dan otomatis meng-apply begitu user login.
 */
export default function CaptureReferral() {
  useEffect(() => {
    if (!isRemote()) return;

    // 1) Tangkap kode dari URL jika ada
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.toUpperCase().startsWith("REF-")) {
      try {
        window.localStorage.setItem(REF_KEY, ref.toUpperCase());
      } catch {
        // ignore
      }
      // Bersihkan param agar tidak terus muncul di URL
      params.delete("ref");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`
      );
    }

    // 2) Jika ada kode tersimpan dan user sudah login → apply
    void (async () => {
      let stored: string | null = null;
      let alreadyApplied = false;
      try {
        stored = window.localStorage.getItem(REF_KEY);
        alreadyApplied = window.localStorage.getItem(APPLIED_KEY) === "1";
      } catch {
        return;
      }
      if (!stored || alreadyApplied) return;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return; // akan diapply setelah login berikutnya

        const res = await fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: stored }),
        });
        if (res.ok) {
          window.localStorage.setItem(APPLIED_KEY, "1");
          window.localStorage.removeItem(REF_KEY);
        } else if (res.status === 409 || res.status === 404) {
          // kode invalid/terpakai/self → buang agar tidak retry
          window.localStorage.removeItem(REF_KEY);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return null;
}
