import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isRemote()) {
    return NextResponse.json({ ok: false, error: "DEMO_MODE" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "rakensadwifa@gmail.com";
  if (user.email !== adminEmail) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  // Fetch all payments
  const { data: payments, error: payError } = await adminClient
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (payError) {
    return NextResponse.json({ ok: false, error: "DB_ERROR_PAYMENTS" }, { status: 500 });
  }

  // Fetch all ucapans
  const { data: ucapans, error: ucError } = await adminClient
    .from("ucapan")
    .select("*")
    .order("created_at", { ascending: false });

  if (ucError) {
    return NextResponse.json({ ok: false, error: "DB_ERROR_UCAPAN" }, { status: 500 });
  }

  // Fetch all views stats
  const { data: statsRows } = await adminClient
    .from("ucapan_stats")
    .select("ucapan_id, total_views, first_view_at, last_view_at");

  const statsMap = new Map(
    (statsRows ?? []).map((s: { ucapan_id: string; total_views: number }) => [s.ucapan_id, s.total_views])
  );

  const enrichedUcapans = (ucapans ?? []).map((u) => ({
    ...u,
    totalViews: statsMap.get(u.id) || 0,
  }));

  const totalRevenue = (payments ?? [])
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPaidCount = (payments ?? []).filter((p) => p.status === "PAID").length;

  return NextResponse.json({
    ok: true,
    stats: {
      totalRevenue,
      totalPaidCount,
      totalUcapans: (ucapans ?? []).length,
      totalPayments: (payments ?? []).length,
    },
    payments: payments ?? [],
    ucapans: enrichedUcapans,
  });
}
