"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function FloatingChat() {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href="/templates"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed z-50 flex items-center justify-center rounded-full bg-[#010101] text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 bottom-6 right-5 h-14 w-14"
      aria-label="Butuh bantuan? Chat Admin"
    >
      <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping -z-10 opacity-75" />
      {hover && (
        <div className="absolute right-[120%] top-1/2 -translate-y-1/2 bg-white text-on-surface font-medium px-4 py-2.5 rounded-2xl shadow-lg border border-[#E8DCCF] text-xs md:text-sm whitespace-nowrap opacity-100 scale-100 transition-all duration-300 pointer-events-none">
          Butuh bantuan? Chat Admin
        </div>
      )}
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
    </Link>
  );
}
