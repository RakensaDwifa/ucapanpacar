"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid, TimelineSection } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

const SPLASH_PARTICLES = Array.from({ length: 14 }).map(() => ({
  left: 10 + Math.random() * 80,
  y: -80 - Math.random() * 120,
}));

export default function BotolKenangan({ content, preview }: TemplateRenderProps) {
  const [broken, setBroken] = useState(Boolean(preview));
  const [shaking, setShaking] = useState(false);

  const smash = () => {
    if (broken) return;
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      setBroken(true);
    }, 900);
  };

  return (
    <TemplateShell
      content={content}
      className="bg-gradient-to-b from-[#BFE3F5] via-[#D8EFF9] to-[#F7E3C0]"
    >
      <AnimatePresence mode="wait">
        {!broken ? (
          <motion.div
            key="bottle"
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-label-lg font-semibold text-[#2E5E7A] mb-10 text-center"
            >
              Sebuah botol terdampar di pantai… 🌊
              <br />
              <span className="text-body-md font-medium">Ada pesan di dalamnya.</span>
            </motion.p>

            <motion.button
              onClick={smash}
              aria-label="Pecahkan botol"
              className="relative select-none cursor-pointer"
              animate={shaking ? { x: [0, -8, 8, -6, 6, 0], rotate: [0, -5, 5, -3, 3, 0] } : {}}
              transition={{ duration: 0.5, repeat: shaking ? 2 : 0 }}
              whileHover={!broken ? { scale: 1.06 } : {}}
              whileTap={!broken ? { scale: 0.94 } : {}}
            >
              <div className="relative w-36 h-52">
                {/* neck */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-7 h-14 rounded-t-md bg-[#8FD0E8]" />
                {/* cork */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-7 rounded bg-[#C89B6D] shadow" />
                {/* body */}
                <div className="absolute inset-x-0 bottom-0 top-10 rounded-b-[3rem] rounded-t-xl bg-[#6BC2E0]/90 border-[6px] border-white/40" />
                {/* water */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[70%] h-[45%] rounded-b-[2.4rem] bg-[#2E8FB8]/70 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">📜</span>
                </div>
                {/* shine */}
                <div className="absolute left-5 top-14 w-3 h-24 rounded-full bg-white/40 rotate-6" />
              </div>
            </motion.button>

            {shaking && (
              <motion.div
                className="fixed inset-0 pointer-events-none z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {SPLASH_PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-3xl"
                    style={{ left: `${p.left}%`, top: "40%" }}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.5, y: p.y }}
                    transition={{ duration: 0.8 }}
                  >
                    💧
                  </motion.span>
                ))}
              </motion.div>
            )}

            <p className="text-body-md text-[#2E5E7A]/80 mt-8 italic text-center">
              {shaking ? "Botolnya bergetar… 💦" : "Ketuk botolnya untuk membukanya!"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="note"
            initial={{ opacity: 0, scale: 0.9, rotateX: 90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              className="absolute inset-x-10 -top-6 text-center text-4xl"
              initial={{ opacity: 0, y: -20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
            >
              💫
            </motion.div>
            <div className="bg-[#FFF6E3] rounded-3xl border border-[#E8DCC0] shadow-[0_16px_50px_rgba(46,94,122,0.25)] p-8 rotate-1">
              <p className="font-heading italic text-[#C4873E] text-3xl text-center mb-1">
                {content.title}
              </p>
              <p className="text-center text-label-lg font-semibold text-[#8A6A3E] mb-6">
                Untuk: {content.toName}
              </p>
              <div className="border-t border-[#E8DCC0] pt-6">
                <p className="text-body-lg leading-relaxed text-[#5A4A2F] whitespace-pre-line text-center">
                  {content.message}
                </p>
                <Signature fromName={content.fromName} />
              </div>
              <PhotoGrid photos={content.photos} />
              <TimelineSection timeline={content.timeline} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}
