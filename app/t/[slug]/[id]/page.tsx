import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import { mapUcapanRow } from "@/lib/supabase/rows";
import type { UcapanRow } from "@/lib/supabase/rows";
import PublicView from "@/components/view/PublicView";

export const metadata: Metadata = {
  title: "Sebuah Ucapan Untukmu",
  description: "Seseorang membuatkan ucapan spesial untukmu.",
};

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
