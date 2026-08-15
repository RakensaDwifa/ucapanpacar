"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

const SLIDES = [
  {
    gradient: "bg-gradient-to-br from-[#FFD9E2] to-[#F5A8Bf]",
    emoji: "💑",
    title: "Buat Momen Spesial Anda",
    caption: "Untuk : Kesayangan ❤️",
  },
  {
    gradient: "bg-gradient-to-br from-[#C9E7F5] to-[#8FC9E3]",
    emoji: "💍",
    title: "Buat Momen Spesial Anda",
    caption: "Untuk : Kesayangan ❤️",
  },
  {
    gradient: "bg-gradient-to-br from-[#FBE3D0] to-[#F2BC96]",
    emoji: "🌹",
    title: "Buat Momen Spesial Anda",
    caption: "Untuk : Kesayangan ❤️",
  },
  {
    gradient: "bg-gradient-to-br from-[#E8DFF7] to-[#C5B3E8]",
    emoji: "🎆",
    title: "Buat Momen Spesial Anda",
    caption: "Untuk : Kesayangan ❤️",
  },
];

export default function PolaroidCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full max-w-[380px] h-[420px] mx-auto">
      <AnimatePresence mode="popLayout">
        {SLIDES.map((slide, i) => {
          const offset = (i - index + SLIDES.length) % SLIDES.length;
          if (offset > 2) return null;
          const rotate = offset === 0 ? -2 : offset === 1 ? 4 : -6;
          const z = offset === 0 ? 30 : 30 - offset * 10;
          return (
            <motion.div
              key={i}
              className="absolute inset-0 p-4"
              initial={{ opacity: 0, scale: 0.85, x: 60 }}
              animate={{ opacity: offset === 0 ? 1 : 0.55, scale: 1 - offset * 0.06, x: offset * 34, rotate }}
              exit={{ opacity: 0, scale: 0.85, x: -60 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ zIndex: z }}
            >
              <div className="polaroid h-full flex flex-col bg-white p-3 pb-4 rounded-lg shadow-[0_10px_30px_rgba(34,25,26,0.14)] border border-surface-container-highest">
                <div
                  className={`flex-1 rounded-md ${slide.gradient} flex items-center justify-center text-7xl`}
                >
                  {slide.emoji}
                </div>
                <div className="mt-2.5 p-3 bg-surface/90 border border-surface-container-highest rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  <div className="text-left">
                    <p className="text-label-md font-bold text-on-surface leading-tight">
                      {slide.title}
                    </p>
                    <p className="text-[10px] font-medium text-on-surface-variant mt-0.5">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
