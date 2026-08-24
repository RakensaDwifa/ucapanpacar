import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RECOVERY_DELAY_MS = 30 * 60 * 1000; // 30 menit
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // jangan email draft >7 hari

/**
 * Dipanggil Vercel Cron. Kirim email recovery untuk checkout yang
 * pending > 30 menit dan belum dibayar.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  if (!isRemote()) {
    return NextResponse.json({ ok: true, skipped: "DEMO_MODE" });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - RECOVERY_DELAY_MS).toISOString();
  const maxAge = new Date(Date.now() - MAX_AGE_MS).toISOString();

  const { data: sessions, error } = await admin
    .from("checkout_sessions")
    .select(
      "id, ucapan_id, started_at, ucapan:ucapan_id(email, to_name, from_name, template_slug, paid)"
    )
    .eq("recovery_email_sent", false)
    .lt("started_at", cutoff)
    .gt("started_at", maxAge)
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  let sent = 0;
  let skippedPaid = 0;
  let skippedNoEmail = 0;

  for (const raw of sessions ?? []) {
    type SessionRow = {
      id: string;
      ucapan_id: string;
      ucapan:
        | {
            email: string | null;
            to_name: string;
            from_name: string;
            template_slug: string;
            paid: boolean;
          }
        | null;
    };
    const s = raw as unknown as SessionRow;
    const u = Array.isArray(s.ucapan) ? s.ucapan[0] : s.ucapan;

    if (!u || u.paid) {
      skippedPaid += 1;
      continue;
    }
    if (!u.email) {
      skippedNoEmail += 1;
      // Tandai supaya tidak diproses terus-menerus
      await admin
        .from("checkout_sessions")
        .update({ recovery_email_sent: true })
        .eq("id", s.id);
      continue;
    }

    try {
      const { sendAbandonedCartEmail } = await import("@/lib/email");
      const res = await sendAbandonedCartEmail({
        to: u.email,
        fromName: u.from_name,
        toName: u.to_name,
        templateSlug: u.template_slug,
        ucapanId: s.ucapan_id,
      });
      await admin
        .from("checkout_sessions")
        .update({ recovery_email_sent: true, recovery_sent_at: new Date().toISOString() })
        .eq("id", s.id);
      if (res.ok) sent += 1;
    } catch {
      // biarkan session dicoba lagi di run berikutnya
    }
  }

  return NextResponse.json({
    ok: true,
    processed: sessions?.length ?? 0,
    sent,
    skippedPaid,
    skippedNoEmail,
  });
}
