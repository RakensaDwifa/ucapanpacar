import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const REWARD_AMOUNT = 5000;

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i += 1) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `REF-${s}`;
}

/** Ambil kode referral milik user, buat baru jika belum ada. */
export async function getOrCreateReferralCode(
  userId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("referrals")
    .select("code")
    .eq("referrer_id", userId)
    .limit(1)
    .maybeSingle();
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomCode();
    const { data, error } = await admin
      .from("referrals")
      .insert({ referrer_id: userId, code })
      .select("code")
      .single();
    if (!error && data?.code) return data.code;
  }
  return null;
}

export interface ReferralStats {
  invited: number;
  completed: number;
  earned: number;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const admin = createAdminClient();

  const { data: refs } = await admin
    .from("referrals")
    .select("id,status")
    .eq("referrer_id", userId);

  const all = refs ?? [];
  const completed = all.filter((r) => r.status === "completed").length;

  const { data: credits } = await admin
    .from("credits")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "referral");

  const earned = (credits ?? []).reduce((sum, c) => sum + (c.amount ?? 0), 0);

  return {
    invited: all.filter((r) => r.status !== "expired").length,
    completed,
    earned,
  };
}

/** Terapkan kode referral untuk user yang login (sebagai referee). */
export async function applyReferralCode(
  code: string,
  refereeId: string
): Promise<{ ok: boolean; error?: "INVALID" | "SELF" | "ALREADY_USED" | "DB_ERROR" }> {
  const admin = createAdminClient();

  const { data: referral } = await admin
    .from("referrals")
    .select("id,referrer_id,referee_id,status")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!referral || referral.status !== "pending") {
    return { ok: false, error: "INVALID" };
  }
  if (referral.referrer_id === refereeId) {
    return { ok: false, error: "SELF" };
  }

  const { error } = await admin
    .from("referrals")
    .update({ referee_id: refereeId })
    .eq("id", referral.id)
    .is("referee_id", null);

  if (error) return { ok: false, error: "ALREADY_USED" };
  return { ok: true };
}

/**
 * Selesaikan semua referral pending milik `userId` (dipanggil saat
 * pembayaran pertamanya sukses). Beri credit ke masing-masing referrer.
 */
export async function completePendingReferrals(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: pendings } = await admin
    .from("referrals")
    .select("id,referrer_id,reward_amount")
    .eq("referee_id", userId)
    .eq("status", "pending");

  for (const r of pendings ?? []) {
    const now = new Date().toISOString();
    await admin
      .from("referrals")
      .update({ status: "completed", completed_at: now })
      .eq("id", r.id);
    await admin.from("credits").insert({
      user_id: r.referrer_id,
      amount: r.reward_amount ?? REWARD_AMOUNT,
      type: "referral",
      reference_id: r.id,
    });
  }
}
