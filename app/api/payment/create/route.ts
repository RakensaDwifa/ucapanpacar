import { NextResponse } from "next/server";
import { createTripayTransaction } from "@/lib/tripay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { ucapanId?: string; method?: string; customerName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.ucapanId || !body.method) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  const result = await createTripayTransaction({
    ucapanId: body.ucapanId,
    method: body.method,
    customerName: body.customerName ?? "Pelanggan",
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }
  return NextResponse.json(result);
}
