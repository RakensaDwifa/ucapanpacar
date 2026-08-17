import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRemote } from "@/lib/supabase/config";
import { mapUcapanRow, toUcapanRow } from "@/lib/supabase/rows";
import type { UcapanRow, UcapanStatsRow } from "@/lib/supabase/rows";

export const dynamic = "force-dynamic";

const EDIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface FetchResult {
  ucapan: ReturnType<typeof mapUcapanRow> | null;
  user: { id: string } | null;
}

async function fetchUcapanAdmin(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ucapan")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const { data: stats } = await supabase
    .from("ucapan_stats")
    .select("ucapan_id, total_views, first_view_at, last_view_at")
    .eq("ucapan_id", id)
    .maybeSingle();

  return mapUcapanRow(data as UcapanRow, stats as UcapanStatsRow | null);
}

async function fetchUcapan(id: string): Promise<FetchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("ucapan").select("*").eq("id", id);
  if (!user) {
    query = query.eq("paid", true);
  }
  const { data, error } = await query.maybeSingle();
  if (error || !data) return { ucapan: null, user };

  const { data: stats } = await supabase
    .from("ucapan_stats")
    .select("ucapan_id, total_views, first_view_at, last_view_at")
    .eq("ucapan_id", id)
    .maybeSingle();

  return {
    ucapan: mapUcapanRow(data as UcapanRow, stats as UcapanStatsRow | null),
    user,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isRemote()) {
    return NextResponse.json({ ok: true, demo: true, ucapan: null });
  }
  const { id } = await params;
  const ucapan = await fetchUcapanAdmin(id);
  if (!ucapan) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, demo: false, ucapan });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isRemote()) {
    return NextResponse.json({ ok: false, error: "DEMO_MODE" }, { status: 400 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ucapan, user } = await fetchUcapan(id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }
  if (!ucapan) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  const supabase = await createClient();

  if (body.activate === true) {
    const { error } = await supabase
      .from("ucapan")
      .update({ paid: true, paid_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const reference = ucapan.paidAt ?? ucapan.createdAt;
  if (ucapan.paid && Date.now() - reference > EDIT_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: "EDIT_WINDOW_EXPIRED" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("ucapan")
    .update({ ...toUcapanRow(body as never), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isRemote()) {
    return NextResponse.json({ ok: false, error: "DEMO_MODE" }, { status: 400 });
  }
  const { id } = await params;
  const { ucapan, user } = await fetchUcapan(id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }
  if (!ucapan) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from("ucapan").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
