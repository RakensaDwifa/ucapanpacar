import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-callback-signature") ?? "";

  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ success: false, message: "Webhook belum dikonfigurasi" }, { status: 503 });
  }

  const expected = crypto
    .createHmac("sha256", privateKey)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ success: false, message: "Signature tidak valid" }, { status: 401 });
  }

  const data = JSON.parse(payload);
  const isPaid = data.status === "PAID";
  const merchantRef: string = data.merchant_ref ?? "";
  const now = new Date().toISOString();

  if (isPaid && isRemote()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();

    const { data: payment } = await admin
      .from("payments")
      .select("ucapan_id")
      .eq("merchant_ref", merchantRef)
      .maybeSingle();

    let ucapanId: string | null = payment?.ucapan_id ?? null;

    if (!ucapanId && merchantRef.startsWith("UP-")) {
      const id8 = merchantRef.slice(3, 11);
      const { data: fallback } = await admin
        .from("ucapan")
        .select("id")
        .like("id", `${id8}%`)
        .maybeSingle();
      ucapanId = fallback?.id ?? null;
    }

    if (ucapanId) {
      await admin
        .from("payments")
        .update({
          status: "PAID",
          method: data.payment_method ?? undefined,
          tripay_ref: data.reference ?? null,
          paid_at: now,
        })
        .eq("merchant_ref", merchantRef);

      await admin
        .from("ucapan")
        .update({ paid: true, paid_at: now, updated_at: now })
        .eq("id", ucapanId);

      console.info("[payment-webhook] PAID + DB aktif", { ref: merchantRef, ucapanId });
    } else {
      console.warn("[payment-webhook] PAID tetapi ucapan tidak ditemukan", {
        ref: merchantRef,
      });
    }
  } else {
    console.info("[payment-webhook] PAID (mode demo)", {
      ref: merchantRef,
      amount: data.amount,
      method: data.payment_method,
    });
  }

  return NextResponse.json({ success: true });
}
