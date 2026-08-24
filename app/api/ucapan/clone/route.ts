import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import type { UcapanRow } from "@/lib/supabase/rows";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isRemote()) {
    return NextResponse.json({ ok: false, error: "DEMO_MODE" }, { status: 400 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const sourceId = body.id;
  if (!sourceId) {
    return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }

  // Fetch sumber — hanya milik user ini
  const { data: source, error: fetchErr } = await supabase
    .from("ucapan")
    .select("*")
    .eq("id", sourceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchErr || !source) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  const src = source as UcapanRow;
  const now = new Date().toISOString();

  // Clone: konten sama, status unpaid, judul diberi suffix
  const { data: clone, error: insertErr } = await supabase
    .from("ucapan")
    .insert({
      owner_id: user.id,
      template_slug: src.template_slug,
      to_name: src.to_name,
      from_name: src.from_name,
      title: `${src.title || "Untuk Kamu"} (Salinan)`,
      message: src.message,
      photos: src.photos ?? [],
      music_url: src.music_url,
      email: src.email,
      timeline: src.timeline,
      paid: false,
      paid_at: null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (insertErr || !clone) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: clone.id });
}
