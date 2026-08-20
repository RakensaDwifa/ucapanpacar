import type { UcapanContent } from "@/lib/types";

export interface UcapanRow {
  id: string;
  template_slug: string;
  to_name: string;
  from_name: string;
  title: string;
  message: string;
  photos: string[];
  music_url: string | null;
  email: string | null;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UcapanStatsRow {
  ucapan_id: string;
  total_views: number;
  first_view_at: string | null;
  last_view_at: string | null;
}

export interface ViewSummary {
  count: number;
  firstSeen?: number;
  lastSeen?: number;
}

export interface StoredUcapan extends UcapanContent {
  id: string;
  paid: boolean;
  paidAt?: number;
  createdAt: number;
  views?: ViewSummary;
}

export function mapUcapanRow(
  row: UcapanRow,
  stats?: UcapanStatsRow | null
): StoredUcapan {
  return {
    id: row.id,
    templateSlug: row.template_slug,
    toName: row.to_name,
    fromName: row.from_name,
    title: row.title,
    message: row.message,
    photos: row.photos ?? [],
    musicUrl: row.music_url ?? undefined,
    email: row.email ?? undefined,
    paid: row.paid,
    paidAt: row.paid_at ? Date.parse(row.paid_at) : undefined,
    createdAt: Date.parse(row.created_at),
    views: stats
      ? {
          count: stats.total_views ?? 0,
          firstSeen: stats.first_view_at
            ? Date.parse(stats.first_view_at)
            : undefined,
          lastSeen: stats.last_view_at
            ? Date.parse(stats.last_view_at)
            : undefined,
        }
      : undefined,
  };
}

export function toUcapanRow(content: Partial<UcapanContent>) {
  return {
    template_slug: content.templateSlug ?? "",
    to_name: content.toName ?? "",
    from_name: content.fromName ?? "",
    title: content.title ?? "",
    message: content.message ?? "",
    photos: content.photos ?? [],
    music_url: content.musicUrl ?? null,
    email: content.email?.trim() || null,
  };
}
