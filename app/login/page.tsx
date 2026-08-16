import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke dashboard UcapanPacar.",
};

export default async function LoginPage() {
  if (isRemote()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return <LoginForm remote={isRemote()} />;
}
