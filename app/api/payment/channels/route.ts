import { NextResponse } from "next/server";
import { midtransConfigured } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

const ACTIVE_CHANNELS = [
  { group: "QRIS", code: "qris", name: "QRIS (semua e-wallet & m-banking)", type: "qris" },
  { group: "E-Wallet", code: "gopay", name: "GoPay", type: "gopay" },
  { group: "E-Wallet", code: "shopeepay", name: "ShopeePay", type: "shopeepay" },
  { group: "E-Wallet", code: "ovo", name: "OVO", type: "ovo" },
  { group: "E-Wallet", code: "dana", name: "DANA", type: "dana" },
];

export async function GET() {
  if (!midtransConfigured()) {
    return NextResponse.json({ demo: true, channels: [] });
  }
  return NextResponse.json({ demo: false, channels: ACTIVE_CHANNELS });
}
