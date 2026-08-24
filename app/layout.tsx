import type { Metadata } from "next";
import { DM_Serif_Display, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FloatingChat from "@/components/landing/FloatingChat";
import CaptureReferral from "@/components/referral/CaptureReferral";
import { ToasterWrapper } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";
import { isRemote } from "@/lib/supabase/config";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "UcapanPacar — Buat Momen Spesial Jadi Tak Terlupakan",
    template: "%s — UcapanPacar",
  },
  description:
    "Buat website ucapan personal untuk pacar kamu. Birthday, anniversary, love letter — kirim kejutan yang bikin dia tersenyum. Cuma Rp 8.900.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let userEmail: string | null = null;
  let userName: string | null = null;
  let userAvatar: string | null = null;
  if (isRemote()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email ?? null;
      userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
      userAvatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;
    }
  }

  return (
    <html lang="id" className={`${poppins.variable} ${dmSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d96c8a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UcapanPacar" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("up_theme");var d=t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Header userEmail={userEmail} userName={userName} userAvatar={userAvatar} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingChat />
        <CaptureReferral />
        <ToasterWrapper />
        <Analytics />
      </body>
    </html>
  );
}
