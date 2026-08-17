import { NextResponse } from "next/server";
import { checkMidtransStatus } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await checkMidtransStatus(ref);
  return NextResponse.json(result);
}
