import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import ReferralDashboard from "@/components/dashboard/ReferralDashboard";

export const metadata: Metadata = {
  title: "Program Referral",
  description: "Ajak teman, dapatkan saldo reward.",
};

export default async function ReferralPage() {
  if (isRemote()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return <ReferralDashboard />;
}
