import { NextResponse } from "next/server";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json();
  const signatureKey: string = payload.signature_key ?? "";
  const orderId: string = payload.order_id ?? "";
  const statusCode: string = String(payload.status_code ?? "");
  const grossAmount: string = String(payload.gross_amount ?? "");
  const transactionStatus: string = payload.transaction_status ?? "";
  const fraudStatus: string | undefined = payload.fraud_status;

  const { verifyMidtransSignature } = await import("@/lib/midtrans");

  if (!verifyMidtransSignature(orderId, statusCode, grossAmount, signatureKey)) {
    return NextResponse.json({ success: false, message: "Signature tidak valid" }, { status: 401 });
  }

  const isPaid =
    (transactionStatus === "settlement" || transactionStatus === "capture") &&
    statusCode === "200" &&
    (!fraudStatus || fraudStatus === "accept");

  const merchantRef = orderId;
  const now = new Date().toISOString();

  if (isPaid && isRemote()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();

    const { data: payment } = await admin
      .from("payments")
      .select("ucapan_id,status")
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
      const alreadyPaid = payment?.status === "PAID";
      await admin
        .from("payments")
        .update({
          status: "PAID",
          method: payload.payment_type ?? "snap",
          tripay_ref: payload.transaction_id ?? null,
          paid_at: now,
        })
        .eq("merchant_ref", merchantRef);

      if (!alreadyPaid) {
        await admin
          .from("ucapan")
          .update({ paid: true, paid_at: now, updated_at: now })
          .eq("id", ucapanId);
      }

      console.info("[payment-webhook] PAID + DB aktif", { ref: merchantRef, ucapanId });
    } else {
      console.warn("[payment-webhook] PAID tetapi ucapan tidak ditemukan", {
        ref: merchantRef,
      });
    }
  } else {
    console.info("[payment-webhook] status non-PAID", {
      ref: merchantRef,
      status: transactionStatus,
      statusCode,
    });
  }

  return NextResponse.json({ success: true });
}