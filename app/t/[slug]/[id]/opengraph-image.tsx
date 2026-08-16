import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRemote } from "@/lib/supabase/config";

export const alt = "Sebuah Ucapan Untukmu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEMPLATE_COLORS: Record<string, [string, string]> = {
  "amplop-cinta": ["#FFD9E2", "#FFB0C6"],
  "botol-kenangan": ["#C9E7F5", "#9FD4E8"],
  "buket-bunga": ["#FBE3D0", "#F5C6A8"],
  "surat-cinta": ["#F7E7C9", "#EED9AC"],
  "kartu-ucapan": ["#FFE9CE", "#FFC98F"],
  valentine: ["#FFDDE3", "#FF9DB0"],
  "permintaan-maaf": ["#E6EFE6", "#BFD8BF"],
};

const FALLBACK = {
  toName: "Sayang",
  fromName: "Seseorang",
  title: "Sebuah Ucapan Untukmu",
  slug: "amplop-cinta",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;

  let data = FALLBACK;
  if (isRemote()) {
    try {
      const supabase = createAdminClient();
      const { data: row } = await supabase
        .from("ucapan")
        .select("template_slug,to_name,from_name,title")
        .eq("id", id)
        .maybeSingle();
      if (row) {
        data = {
          toName: row.to_name ?? FALLBACK.toName,
          fromName: row.from_name ?? FALLBACK.fromName,
          title: row.title ?? FALLBACK.title,
          slug: row.template_slug ?? FALLBACK.slug,
        };
      }
    } catch {
      data = FALLBACK;
    }
  }

  const [c1, c2] = TEMPLATE_COLORS[data.slug] ?? TEMPLATE_COLORS["amplop-cinta"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          fontFamily: "sans-serif",
          color: "#4A2B33",
          padding: 80,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -140,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: -160,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.8)",
              color: "#E95D83",
              fontSize: 44,
              fontWeight: 800,
              marginBottom: 36,
            }}
          >
            ♥
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 8,
              textTransform: "uppercase",
              opacity: 0.65,
              marginBottom: 20,
            }}
          >
            Ucapan Spesial
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            Untuk {data.toName}
          </div>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 10,
              borderRadius: 999,
              background: "#E95D83",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 600,
              maxWidth: 760,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 500,
              opacity: 0.75,
              marginTop: 36,
            }}
          >
            — dari {data.fromName}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}