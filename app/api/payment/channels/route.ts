import { NextResponse } from "next/server";
import { getPaymentChannels, tripayConfigured } from "@/lib/tripay";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!tripayConfigured()) {
    return NextResponse.json({ demo: true, channels: [] });
  }
  const channels = await getPaymentChannels();
  return NextResponse.json({ demo: false, channels });
}
