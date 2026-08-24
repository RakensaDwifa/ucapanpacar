"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid, OpenButton, TimelineSection } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

const FLOWERS = [
  { emoji: "🌹", x: -90, y: -40, delay: 0.1, size: 44 },
  { emoji: "🌷", x: 90, y: -40, delay: 0.25, size: 44 },
  { emoji: "🌻", x: -40, y: -110, delay: 0.4, size: 40 },
  { emoji: "🌸", x: 40, y: -110, delay: 0.55, size: 40 },
  { emoji: "🌺", x: 0, y: -150, delay: 0.7, size: 44 },
  { emoji: "💐", x: 0, y: -60, delay: 0.85, size: 34 },
];

export default function BuketBunga({ content, preview }: TemplateRenderProps) {
  const [assembled, setAssembled] = useState(Boolean(preview));
  const [revealed, setRevealed] = useState(Boolean(preview));
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const confetti = useMemo(() => {
    if (!isClient) {
      // Server-side: deterministic defaults
      return Array.from({ length: 8 }, (_, i) => ({
        left: 20 + (i * 7.5) % 60,
        top: -30 + i * 4,
        y: -90 - (i * 7.5) % 60,
      }));
    }
    // Client-side: random
    return Array.from({ length: 8 }, (_, i) => ({
      left: 20 + Math.random() * 60,
      top: -30 + i * 4,
      y: -90 - Math.random() * 60,
    }));
  }, [isClient]);

  const start = () => {
    if (assembled) return;
    setAssembled(true);
    setTimeout(() => setRevealed(true), 2200);
  };

  return (
    <TemplateShell
      content={content}
      className="bg-gradient-to-b from-[#FFF3E8] via-[#FBE3D0] to-[#F5C6A8]"
    >
      <AnimatePresence mode="wait">
        {!assembled ? (
          <motion.div
            key="start"
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-label-lg font-semibold text-[#A4582F] mb-8 text-center"
            >
              Merangkai buket bunga untuk {content.toName}… 🎀
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <OpenButton onClick={start} label="Rangkai Buket" />
            </motion.div>
            <p className="text-body-md text-[#A4582F]/80 mt-6 italic">
              Ketuk untuk mulai merangkai ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="bouquet"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative w-64 h-72 mb-6">
              {FLOWERS.map((f) => (
                <motion.span
                  key={f.emoji + f.x}
                  className="absolute left-1/2 top-24 select-none"
                  style={{ fontSize: f.size }}
                  initial={{ y: 220, opacity: 0, x: 0, rotate: 0 }}
                  animate={
                    assembled
                      ? { y: f.y, opacity: 1, x: f.x, rotate: [0, -12, 10, 0] }
                      : {}
                  }
                  transition={{ delay: f.delay, type: "spring", bounce: 0.55 }}
                >
                  {f.emoji}
                </motion.span>
              ))}
              {/* wrapper */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 w-44 h-40 origin-bottom"
                style={{ clipPath: "polygon(25% 0, 75% 0, 100% 100%, 0 100%)" }}
                initial={{ scaleY: 0 }}
                animate={assembled ? { scaleY: 1 } : {}}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full bg-gradient-to-b from-[#F2A679] to-[#E08B5B]" />
              </motion.div>
              {/* ribbon */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-6 w-20 h-6 rounded-full bg-[#E95D83]"
                initial={{ scale: 0 }}
                animate={assembled ? { scale: 1 } : {}}
                transition={{ delay: 1.2, type: "spring", bounce: 0.6 }}
              />
            </div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 60, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.15 }}
                  className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-8"
                >
                  {confetti.map((c: { left: number; top: number; y: number }, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-2xl pointer-events-none"
                      style={{ left: `${c.left}%`, top: `${c.top}%` }}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: c.y, scale: 1.4 }}
                      transition={{ duration: 1.4, delay: 0.2 + i * 0.08 }}
                    >
                      🎉
                    </motion.span>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">💐</span>
                  </div>
                  <p className="font-heading italic text-primary text-3xl text-center mb-1">
                    {content.title}
                  </p>
                  <p className="text-center text-label-lg font-semibold text-on-surface-variant mb-6">
                    Untuk: {content.toName}
                  </p>
                  <div className="border-t border-outline-variant/30 pt-6">
                    <p className="text-body-lg leading-relaxed text-on-surface whitespace-pre-line text-center">
                      {content.message}
                    </p>
                    <Signature fromName={content.fromName} />
                  </div>
                  <PhotoGrid photos={content.photos} />
                  <TimelineSection timeline={content.timeline} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}
