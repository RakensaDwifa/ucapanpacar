import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRemote } from "@/lib/supabase/config";
import { mapUcapanRow, toUcapanRow } from "@/lib/supabase/rows";
import type { UcapanRow, UcapanStatsRow } from "@/lib/supabase/rows";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isRemote()) {
    return NextResponse.json({ ok: true, demo: true, ucapans: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("ucapan")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  const { data: statsRows } = await supabase
    .from("ucapan_stats")
    .select("ucapan_id, total_views, first_view_at, last_view_at");

  const statsByUcapan = new Map<string, UcapanStatsRow>(
    (statsRows as UcapanStatsRow[] | null)?.map((s) => [s.ucapan_id, s]) ?? []
  );

  const ucapans = (rows as UcapanRow[]).map((row) =>
    mapUcapanRow(row, statsByUcapan.get(row.id))
  );

  return NextResponse.json({ ok: true, demo: false, ucapans });
}

export async function POST(request: Request) {
  if (!isRemote()) {
    return NextResponse.json({ ok: false, error: "DEMO_MODE" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = checkRateLimit(ip, 5, 60000);
  if (!success) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT_EXCEEDED", message: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!body.templateSlug) {
    return NextResponse.json({ ok: false, error: "MISSING_TEMPLATE" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("ucapan")
    .insert({
      owner_id: user?.id ?? null,
      ...toUcapanRow(body as never),
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
