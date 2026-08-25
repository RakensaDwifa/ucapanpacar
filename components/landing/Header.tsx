"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Gift, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { isRemote } from "@/lib/supabase/config";

const NAV_LINKS = [
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Fitur", href: "/#fitur" },
  { label: "Template", href: "/templates" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header({
  userEmail,
  userName,
  userAvatar,
}: {
  userEmail?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    if (isRemote()) {
      await createClient().auth.signOut();
    }
    router.push("/");
    router.refresh();
  };

  const initial =
    (userName?.trim().charAt(0) ?? userEmail?.trim().charAt(0) ?? "U").toUpperCase();

  const avatar = userAvatar ? (
    <img
      src={userAvatar}
      alt={userName ?? "Profil"}
      className="h-9 w-9 rounded-full object-cover border border-outline-variant"
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-label-lg font-bold">
      {initial}
    </div>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-surface-container-low">
      <div className="flex justify-between items-center h-20 px-5 lg:px-16 max-w-[1200px] mx-auto">
        <Logo />

        <nav className="hidden lg:flex items-center space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-md font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {userEmail ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                aria-label="Menu profil"
                className="flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 hover:bg-primary-fixed/20 transition-colors"
              >
                {avatar}
                <span className="max-w-[120px] truncate text-body-md font-semibold text-on-surface">
                  {userName ?? userEmail}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-surface border border-outline-variant/20 shadow-lg p-2 flex flex-col z-50">
                  <div className="px-3 pt-2 pb-3 mb-1 border-b border-outline-variant/20">
                    <p className="text-body-md font-semibold text-on-surface truncate">
                      {userName ?? "Pengguna"}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-body-md font-semibold text-on-surface hover:bg-primary-fixed/20 hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/referral"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-body-md font-semibold text-on-surface hover:bg-primary-fixed/20 hover:text-primary transition-colors"
                  >
                    <Gift className="h-4 w-4" /> Referral
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-body-md font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-body-md font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              Masuk
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="/templates"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white text-body-md font-semibold rounded-full shadow-[0_4px_14px_0_rgba(217,108,138,0.39)] hover:shadow-[0_6px_20px_rgba(217,108,138,0.23)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Buat Ucapan
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            className="text-on-surface p-2"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-surface border-t border-surface-container-low px-5 pb-6 pt-2 flex flex-col gap-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-body-md font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {userEmail ? (
            <>
              <div className="flex flex-col pt-3 border-t border-outline-variant/20">
                <div className="flex items-center gap-3 px-1 py-2.5">
                  {avatar}
                  <div className="min-w-0">
                    <p className="text-body-md font-semibold text-on-surface truncate">
                      {userName ?? "Pengguna"}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-1 py-2.5 rounded-xl text-body-md font-semibold text-on-surface hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  href="/dashboard/referral"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-1 py-2.5 rounded-xl text-body-md font-semibold text-on-surface hover:text-primary transition-colors"
                >
                  <Gift className="h-4 w-4" /> Referral
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="flex items-center gap-2 px-1 py-2.5 rounded-xl text-left text-body-md font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-outline-variant/20">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-1 py-2.5 block text-body-md font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Masuk
              </Link>
            </div>
          )}

          <Link
            href="/templates"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center px-6 py-3 bg-primary text-white text-body-md font-semibold rounded-full shadow-md hover:opacity-90 transition-opacity"
          >
            Buat Ucapan
          </Link>
        </div>
      )}
    </header>
  );
}