export type TemplateCategory =
  | "ungkapan-sayang"
  | "birthday"
  | "anniversary"
  | "permintaan-maaf";

export const CATEGORY_META: Record<
  TemplateCategory,
  { label: string; emoji: string; active: boolean; order: number }
> = {
  "ungkapan-sayang": { label: "Love Message", emoji: "💌", active: true, order: 1 },
  birthday: { label: "Birthday", emoji: "🎂", active: true, order: 2 },
  anniversary: { label: "Anniversary", emoji: "🥂", active: true, order: 3 },
  "permintaan-maaf": { label: "Sorry Message", emoji: "🕊️", active: true, order: 4 },
};

export interface TemplateMeta {
  slug: string;
  name: string;
  type: TemplateCategory;
  description: string;
  active: boolean;
  order: number;
  gradient: string;
}

export interface UcapanContent {
  templateSlug: string;
  toName: string;
  fromName: string;
  title: string;
  message: string;
  photos: string[];
  musicUrl?: string;
  createdAt?: number;
}

export interface TemplateRenderProps {
  content: UcapanContent;
  preview?: boolean;
}

export const MOCK_CONTENT: UcapanContent = {
  templateSlug: "amplop-cinta",
  toName: "Sayang",
  fromName: "Kesayanganmu",
  title: "Untuk Kamu",
  message:
    "Terima kasih sudah selalu ada. Setiap hari bersamamu adalah hadiah yang paling berharga. Aku sayang kamu, hari ini dan selamanya. ❤️",
  photos: [],
};
