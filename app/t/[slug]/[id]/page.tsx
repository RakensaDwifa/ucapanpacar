import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import { mapUcapanRow } from "@/lib/supabase/rows";
import type { UcapanRow } from "@/lib/supabase/rows";
import PublicView from "@/components/view/PublicView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  let toName = "Kamu";
  let fromName = "Seseorang";
  let message = "";

  if (isRemote()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("ucapan")
        .select("to_name,from_name,message")
        .eq("id", id)
        .eq("paid", true)
        .maybeSingle();
      if (data) {
        toName = data.to_name ?? toName;
        fromName = data.from_name ?? fromName;
        message = data.message ?? "";
      }
    } catch {
      // fallback ke nilai default
    }
  }

  const teaser = message.trim().split(/\s+/).slice(0, 18).join(" ");
  const title = `Untuk ${toName} 💌 — dari ${fromName}`;
  const description =
    teaser.length > 0
      ? `Seseorang membuatkan ucapan spesial untukmu: "${teaser}${teaser.endsWith(".") ? "" : "…"}"`
      : "Seseorang membuatkan ucapan spesial untukmu.";

  // OG image via file-convention opengraph-image.tsx (otomatis oleh Next.js)

  return {
    title,
    description,
    alternates: {
      canonical: `/t/${slug}/${id}`,
    },
    // Konten personal: jangan diindex mesin pencari, tapi preview share tetap jalan
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "UcapanPacar",
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ViewRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;

  let remote = null;
  if (isRemote()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ucapan")
      .select("*")
      .eq("id", id)
      .eq("paid", true)
      .maybeSingle();
    remote = data ? mapUcapanRow(data as UcapanRow) : null;
  }

  return <PublicView id={id} remote={remote} />;
}
