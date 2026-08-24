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

      // Tandai sesi recovery selesai jika ada
      try {
        await admin
          .from("checkout_sessions")
          .update({ recovered_at: now })
          .eq("ucapan_id", ucapanId)
          .is("recovered_at", null);
      } catch {
        // non-blocking
      }

      const { data: ucapan } = await admin
        .from("ucapan")
        .select("template_slug, from_name, to_name, email, owner_id")
        .eq("id", ucapanId)
        .maybeSingle();

      console.info("[payment-webhook] PAID + DB aktif", { ref: merchantRef, ucapanId });

      // Selesaikan referral pending milik pembeli (jika login & pakai kode referral)
      if (ucapan?.owner_id) {
        try {
          const { completePendingReferrals } = await import("@/lib/referral");
          await completePendingReferrals(ucapan.owner_id);
        } catch {
          // non-blocking
        }
      }

      if (ucapan?.email) {
        const { sendPaymentSuccessEmail, sendAdminTransactionEmail } = await import(
          "@/lib/email"
        );
        const successRes = await sendPaymentSuccessEmail({
          to: ucapan.email,
          fromName: ucapan.from_name,
          toName: ucapan.to_name,
          templateSlug: ucapan.template_slug,
          ucapanId,
        });
        if (!successRes.ok) {
          console.warn("[payment-webhook] email pembeli gagal", successRes);
        }
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const adminRes = await sendAdminTransactionEmail({
            to: adminEmail,
            fromName: ucapan.from_name,
            toName: ucapan.to_name,
            templateSlug: ucapan.template_slug,
            amount: Number(payload.gross_amount ?? 8900),
          });
          if (!adminRes.ok) {
            console.warn("[payment-webhook] email admin gagal", adminRes);
          }
        }
      } else {
        console.info("[payment-webhook] tidak ada email pembeli", { ucapanId });
      }
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

    // Catat sesi checkout untuk abandoned-cart recovery
    if (transactionStatus === "pending" && isRemote() && merchantRef.startsWith("UP-")) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const admin = createAdminClient();
        const id8 = merchantRef.slice(3, 11);
        const { data: u } = await admin
          .from("ucapan")
          .select("id,email")
          .like("id", `${id8}%`)
          .maybeSingle();
        if (u?.id) {
          const { data: existing } = await admin
            .from("checkout_sessions")
            .select("id")
            .eq("ucapan_id", u.id)
            .limit(1)
            .maybeSingle();
          if (!existing) {
            await admin.from("checkout_sessions").insert({
              ucapan_id: u.id,
              email: u.email ?? null,
              started_at: now,
            });
          }
        }
      } catch {
        // non-blocking — jangan gagalkan webhook
      }
    }
  }

  return NextResponse.json({ success: true });
}