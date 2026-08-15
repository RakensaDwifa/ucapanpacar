"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Fitur", href: "/#fitur" },
  { label: "Template", href: "/templates" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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

        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-body-md font-semibold text-gray-600 hover:text-primary transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white text-body-md font-semibold rounded-full shadow-[0_4px_14px_0_rgba(217,108,138,0.39)] hover:shadow-[0_6px_20px_rgba(217,108,138,0.23)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Buat Ucapan
          </Link>
        </div>

        <button
          className="lg:hidden text-on-surface p-2"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-surface border-t border-surface-container-low px-5 pb-6 pt-2 flex flex-col gap-4">
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
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-body-md font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/templates"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-body-md font-semibold rounded-full shadow-md"
            >
              Buat Ucapan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
