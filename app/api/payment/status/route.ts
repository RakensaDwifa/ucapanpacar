import { NextResponse } from "next/server";
import { checkTripayStatus } from "@/lib/tripay";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await checkTripayStatus(ref);
  return NextResponse.json(result);
}
