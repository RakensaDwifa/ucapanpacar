import type { UcapanContent } from "./types";

export interface StoredUcapan extends UcapanContent {
  id: string;
  paid: boolean;
  paidAt?: number;
  createdAt: number;
}

const DRAFT_KEY = "up_draft_";
const UCAPAN_KEY = "up_ucapan_";
const VIEWS_KEY = "up_views_";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage penuh / tidak tersedia — abaikan
  }
}

export function saveDraft(slug: string, content: Partial<UcapanContent>): UcapanContent {
  const existing = read<UcapanContent>(DRAFT_KEY + slug) ?? {
    templateSlug: slug,
    toName: "",
    fromName: "",
    title: "",
    message: "",
    photos: [],
  };
  const merged = { ...existing, ...content, templateSlug: slug };
  write(DRAFT_KEY + slug, merged);
  return merged;
}

export function getDraft(slug: string): UcapanContent | null {
  return read<UcapanContent>(DRAFT_KEY + slug);
}

export function clearDraft(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY + slug);
}

export function savePaidUcapan(ucapan: StoredUcapan) {
  write(UCAPAN_KEY + ucapan.id, ucapan);
}

export function getUcapan(id: string): StoredUcapan | null {
  return read<StoredUcapan>(UCAPAN_KEY + id);
}

export function listUcapan(): StoredUcapan[] {
  if (typeof window === "undefined") return [];
  const result: StoredUcapan[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(UCAPAN_KEY)) {
      const u = read<StoredUcapan>(key);
      if (u) result.push(u);
    }
  }
  return result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function deleteUcapan(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(UCAPAN_KEY + id);
  window.localStorage.removeItem(VIEWS_KEY + id);
}

export interface ViewRecord {
  firstSeen: number;
  count: number;
  lastSeen: number;
}

export function trackView(id: string): ViewRecord {
  const record = read<ViewRecord>(VIEWS_KEY + id) ?? {
    firstSeen: Date.now(),
    count: 0,
    lastSeen: Date.now(),
  };
  record.count += 1;
  record.lastSeen = Date.now();
  write(VIEWS_KEY + id, record);
  return record;
}

export function getViews(id: string): ViewRecord | null {
  return read<ViewRecord>(VIEWS_KEY + id);
}
