import type { UcapanContent } from "./types";
import { createClient } from "@/lib/supabase/client";
import { isRemote } from "@/lib/supabase/config";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

export interface DraftRecord {
  slug: string;
  content: Partial<UcapanContent>;
  updatedAt: number;
}

function toRow(content: Partial<UcapanContent>) {
  return {
    slug: content.templateSlug ?? "",
    content,
  };
}

async function getUserId(): Promise<string | null> {
  if (!isRemote()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Upsert draft ke Supabase untuk user yang login.
 * Return "skipped" jika tidak login / mode demo (bukan error),
 * "ok" jika tersimpan, "error" jika gagal jaringan/db.
 */
export async function saveDraftRemote(
  content: Partial<UcapanContent>
): Promise<"skipped" | "ok" | "error"> {
  const userId = await getUserId();
  if (!userId || !content.templateSlug) return "skipped";

  try {
    const supabase = createClient();
    const { slug, ...rest } = toRow(content);
    const { error } = await supabase.from("drafts").upsert(
      {
        user_id: userId,
        slug,
        content: rest.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,slug" }
    );
    return error ? "error" : "ok";
  } catch {
    return "error";
  }
}

/** Ambil draft remote beserta timestamp. Return null jika tidak login / tidak ada / error. */
export async function getDraftRemote(
  slug: string
): Promise<{ content: Partial<UcapanContent>; updatedAt: number } | null> {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("drafts")
      .select("content, updated_at")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data?.content) return null;
    return {
      content: data.content as Partial<UcapanContent>,
      updatedAt: data.updated_at ? Date.parse(data.updated_at) : 0,
    };
  } catch {
    return null;
  }
}

const LOCAL_TIME_KEY = "up_draft_saved_at_";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Catat waktu lokal terakhir draft disimpan. */
export function markLocalSaved(slug: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_TIME_KEY + slug, JSON.stringify(Date.now()));
  } catch {
    // ignore
  }
}

/** Waktu lokal terakhir draft disimpan (0 jika tidak ada). */
export function getLocalSavedAt(slug: string): number {
  const t = read<number>(LOCAL_TIME_KEY + slug);
  return typeof t === "number" ? t : 0;
}

/** Hapus draft remote (setelah pembayaran sukses / draft dibuang). */
export async function clearDraftRemote(slug: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  try {
    const supabase = createClient();
    await supabase
      .from("drafts")
      .delete()
      .eq("user_id", userId)
      .eq("slug", slug);
  } catch {
    // silent
  }
}
