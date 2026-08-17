import { NextResponse } from "next/server";
import { createSnapTransaction } from "@/lib/midtrans";
import { getUcapan } from "@/lib/store";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { ucapanId?: string; customerName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.ucapanId) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  const ucapanId = body.ucapanId;
  const merchantRef = `UP-${ucapanId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

  let templateSlug: string | null = null;
  if (isRemote()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data } = await admin
      .from("ucapan")
      .select("template_slug")
      .eq("id", ucapanId)
      .maybeSingle();
    templateSlug = data?.template_slug ?? null;
  } else {
    templateSlug = getUcapan(ucapanId)?.templateSlug ?? null;
  }

  if (!templateSlug) {
    return NextResponse.json({ ok: false, error: "UCAPAN_NOT_FOUND" }, { status: 404 });
  }

  if (isRemote()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error: insertError } = await admin.from("payments").insert({
      ucapan_id: ucapanId,
      merchant_ref: merchantRef,
      method: "snap",
      amount: 8900,
      status: "UNPAID",
    });
    if (insertError) {
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }
  }

  const result = await createSnapTransaction({
    ucapanId,
    merchantRef,
    templateSlug,
    customerName: body.customerName ?? "Pelanggan",
  });

  if (!result.ok) {
    if (isRemote()) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      await admin.from("payments").delete().eq("merchant_ref", merchantRef);
    }
    return NextResponse.json(result, { status: 422 });
  }
  return NextResponse.json(result);
}
