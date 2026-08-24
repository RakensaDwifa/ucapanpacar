import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import {
  getOrCreateReferralCode,
  getReferralStats,
  applyReferralCode,
} from "@/lib/referral";

export const dynamic = "force-dynamic";

async function requireUser() {
  if (!isRemote()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }

  const code = await getOrCreateReferralCode(user.id);
  if (!code) {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
  const stats = await getReferralStats(user.id);

  return NextResponse.json({
    ok: true,
    code,
    stats,
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "NEED_LOGIN" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.code) {
    return NextResponse.json({ ok: false, error: "MISSING_CODE" }, { status: 400 });
  }

  const result = await applyReferralCode(body.code, user.id);
  if (!result.ok) {
    const status = result.error === "INVALID" ? 404 : 409;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
