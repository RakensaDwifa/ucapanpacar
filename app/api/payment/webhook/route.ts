import crypto from "node:crypto";
import { NextResponse } from "next/server";

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

  if (isPaid) {
    // Aktivasi ucapan. Saat Supabase terhubung, update status di sini.
    console.info("[payment-webhook] PAID", {
      ref: data.merchant_ref,
      amount: data.amount,
      method: data.payment_method,
    });
  }

  return NextResponse.json({ success: true });
}
