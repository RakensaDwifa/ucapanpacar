import type { TemplateCategory, TemplateMeta, UcapanContent } from "./types";

export const TEMPLATES: TemplateMeta[] = [
  {
    slug: "amplop-cinta",
    name: "Amplop Cinta",
    type: "ungkapan-sayang",
    description:
      "Sebuah surat cinta klasik. Klik amplopnya, dan pesanmu terbuka dengan lembut.",
    active: true,
    order: 1,
    gradient: "from-[#FFD9E2] to-[#FFB0C6]",
  },
  {
    slug: "botol-kenangan",
    name: "Botol Kenangan",
    type: "ungkapan-sayang",
    description:
      "Pesan tersembunyi dalam botol. Pecahkan, dan cerita kalian terbuka satu per satu.",
    active: true,
    order: 2,
    gradient: "from-[#C9E7F5] to-[#9FD4E8]",
  },
  {
    slug: "buket-bunga",
    name: "Buket Bunga",
    type: "birthday",
    description:
      "Rangkai buket bunga digital untuk hari spesialnya, lengkap dengan kejutan di tengahnya.",
    active: true,
    order: 3,
    gradient: "from-[#FBE3D0] to-[#F5C6A8]",
  },
];

export const CATEGORY_ORDER: TemplateCategory[] = [
  "ungkapan-sayang",
  "birthday",
  "anniversary",
  "permintaan-maaf",
];

export function getTemplate(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getActiveTemplates(): TemplateMeta[] {
  return TEMPLATES.filter((t) => t.active).sort((a, b) => a.order - b.order);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function makeUcapanId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const TEMPLATE_EMOJI: Record<string, string> = {
  "amplop-cinta": "💌",
  "botol-kenangan": "🫙",
  "buket-bunga": "💐",
};

export function templateEmoji(slug: string): string {
  return TEMPLATE_EMOJI[slug] ?? "💝";
}

export function fillContentDefaults(
  content: Partial<UcapanContent>
): UcapanContent {
  return {
    templateSlug: content.templateSlug ?? "amplop-cinta",
    toName: content.toName ?? "Sayang",
    fromName: content.fromName ?? "Kesayanganmu",
    title: content.title ?? "Untuk Kamu",
    message: content.message ?? "",
    photos: content.photos ?? [],
    musicUrl: content.musicUrl,
    createdAt: content.createdAt ?? Date.now(),
  };
}
