import Link from "next/link";
import { Camera, Heart, Music } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
];

export default function Footer() {
  return (
    <footer className="w-full py-20 bg-primary">
      <div className="relative z-[1] flex flex-col items-center text-center px-5 md:px-16 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Logo light className="flex-col gap-2" />
          <p className="text-body-md text-white/90 max-w-md mx-auto">
            Buat kejutan serupa untuk orang yang paling kamu sayang.
          </p>
          <Link
            href="/templates"
            className="inline-block px-6 py-3 bg-white text-primary text-label-lg font-semibold rounded-full hover:bg-gray-50 transition-colors duration-300 shadow-md"
          >
            Buat kejutan serupa
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-md text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 hover:text-white hover:bg-white/20 transition-all text-body-sm font-medium"
          >
            <Camera className="h-5 w-5" />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 hover:text-white hover:bg-white/20 transition-all text-body-sm font-medium"
          >
            <Music className="h-5 w-5" />
            <span>TikTok</span>
          </a>
        </div>

        <div className="w-full h-px bg-white/20"></div>
        <p className="text-label-md font-normal text-white/80 flex items-center gap-1 justify-center">
          © 2026 UcapanPacar.com — Dibuat dengan penuh cinta{" "}
          <Heart className="h-4 w-4 fill-current" />
        </p>
      </div>
    </footer>
  );
}
