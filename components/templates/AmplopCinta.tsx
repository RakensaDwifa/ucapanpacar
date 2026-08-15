"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

export default function AmplopCinta({ content, preview }: TemplateRenderProps) {
  const [opened, setOpened] = useState(Boolean(preview));

  return (
    <TemplateShell content={content} className="bg-gradient-to-b from-[#FFF9F7] to-[#FFE3EA]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-label-lg font-semibold text-on-surface-variant mb-8 text-center"
            >
              Sebuah surat untuk {content.toName} 💌
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-64 h-44 cursor-pointer"
              onClick={() => setOpened(true)}
            >
              {/* body */}
              <div className="absolute inset-0 rounded-lg bg-[#E95D83] shadow-[0_14px_35px_rgba(233,93,131,0.4)]" />
              {/* flap */}
              <motion.div
                className="absolute inset-x-0 top-0 h-24 origin-top"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                animate={opened ? { rotateX: 180 } : {}}
                transition={{ duration: 0.6 }}
                initial={false}
              >
                <div className="w-full h-full rounded-t-lg bg-[#D94B72]" />
              </motion.div>
              {/* letter peek */}
              <motion.div
                className="absolute inset-x-3 top-1 bottom-3 rounded-md bg-white shadow-md p-3"
                animate={opened ? { y: -40 } : {}}
                transition={{ duration: 0.5, delay: 0.15 }}
                initial={false}
              >
                <div className="h-1.5 w-3/4 rounded bg-[#FFD9E2] mb-1.5" />
                <div className="h-1.5 w-1/2 rounded bg-[#FFD9E2]" />
              </motion.div>
              {/* front panel */}
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ clipPath: "polygon(0 0, 50% 45%, 100% 0, 100% 100%, 0 100%)" }}>
                <div className="w-full h-full rounded-b-lg bg-[#E95D83]" />
              </div>
              {/* heart cutout */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-10 h-8 bg-[#FFD9E2] rounded-full [clip-path:path('M10,6 C10,2 4,1 4,6 C4,10 10,14 10,14 C10,14 16,10 16,6 C16,1 10,2 10,6 Z')] scale-x-[1.8] opacity-90" />
            </motion.div>

            <p className="text-body-md text-on-surface-variant mt-6 italic text-center">
              Klik amplopnya untuk membuka surat ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border border-outline-variant/30 shadow-card p-8"
          >
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">💌</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}
