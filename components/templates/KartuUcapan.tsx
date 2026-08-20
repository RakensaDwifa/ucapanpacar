"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid, TimelineSection } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

export default function KartuUcapan({ content, preview }: TemplateRenderProps) {
  const [opened, setOpened] = useState(Boolean(preview));

  return (
    <TemplateShell content={content} className="bg-gradient-to-b from-[#FFF4E6] via-[#FFE9CE] to-[#FFD9A8]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-label-lg font-semibold text-on-surface-variant mb-8 text-center"
            >
              Sebuah kartu untuk {content.toName} 🎀
            </motion.p>

            <motion.button
              initial={{ opacity: 0, rotateY: -12, y: 20 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              whileHover={{ rotate: 1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.6 }}
              onClick={() => setOpened(true)}
              className="relative w-72 h-[400px] cursor-pointer"
              style={{ perspective: 1200 }}
              aria-label="Buka kartu ucapan"
            >
              <div className="absolute inset-0 rounded-2xl bg-white shadow-[0_14px_40px_rgba(214,150,63,0.35)] border border-[#F0D9B0] p-5">
                <div className="w-full h-full rounded-xl border-2 border-dashed border-[#E8C98F] flex flex-col items-center justify-center gap-3">
                  <motion.span
                    className="text-6xl drop-shadow-sm"
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    🎂
                  </motion.span>
                  <span className="font-heading italic text-[#B97A2E] text-3xl text-center px-6">
                    Sebuah Kejutan
                  </span>
                  <span className="text-label-md font-semibold text-[#C99A55]">
                    untuk {content.toName}
                  </span>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#D9B67E] mt-2">
                    Klik untuk membuka
                  </span>
                </div>
              </div>
              <motion.div
                className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-[#E8784F] shadow-md flex items-center justify-center"
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-2xl">🎁</span>
              </motion.div>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, rotateY: -18, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md mx-auto bg-white rounded-3xl shadow-[0_14px_45px_rgba(214,150,63,0.3)] border border-[#F0D9B0] p-8"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-x-0 -top-7 flex justify-center"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="px-5 py-2 rounded-full bg-[#E8784F] text-white text-label-md font-semibold shadow-md">
                🎉 Untukmu yang Spesial
              </div>
            </motion.div>

            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🎀</span>
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
    </TemplateShell>
  );
}