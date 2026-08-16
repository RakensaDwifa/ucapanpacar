import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { ucapanId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.ucapanId) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  if (!isRemote()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("views")
    .insert({ ucapan_id: body.ucapanId });

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, demo: false });
}
