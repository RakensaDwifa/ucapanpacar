"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

export default function SuratCinta({ content, preview }: TemplateRenderProps) {
  const [opened, setOpened] = useState(Boolean(preview));

  return (
    <TemplateShell content={content} className="bg-gradient-to-b from-[#FDF6EC] via-[#F9EEDC] to-[#F3E3C8]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-label-lg font-semibold text-on-surface-variant mb-8 text-center"
            >
              Sebuah surat untuk {content.toName} ✉️
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.6 }}
              onClick={() => setOpened(true)}
              className="relative w-72 h-52 cursor-pointer"
              aria-label="Buka surat"
            >
              <div className="absolute inset-0 rounded-xl bg-[#F7E7C9] shadow-[0_14px_35px_rgba(139,109,63,0.35)] border border-[#E4CDA3]" />
              <div className="absolute inset-x-6 top-4 h-1.5 rounded-full bg-[#E4CDA3]" />
              <div className="absolute inset-x-6 top-9 h-1.5 rounded-full bg-[#E4CDA3] opacity-70" />
              <div className="absolute inset-x-6 top-14 h-1.5 rounded-full bg-[#E4CDA3] opacity-50" />
              <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#C25B63] shadow-md flex items-center justify-center"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">❤️</span>
              </motion.div>
            </motion.button>

            <p className="text-body-md text-on-surface-variant mt-6 italic text-center">
              Klik suratnya untuk membaca ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 50, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#FFFDF7] rounded-lg shadow-[0_10px_40px_rgba(139,109,63,0.25)] border border-[#EAD9B8] p-8"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, rgba(178,145,87,0.25) 31px, rgba(178,145,87,0.25) 32px)",
            }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="font-heading italic text-primary text-3xl text-center mb-1">
              {content.title}
            </p>
            <p className="text-center text-label-lg font-semibold text-on-surface-variant mb-6">
              Untuk: {content.toName}
            </p>
            <div className="pt-5">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-body-lg leading-[32px] text-on-surface whitespace-pre-line text-center"
              >
                {content.message}
              </motion.p>
              <Signature fromName={content.fromName} />
            </div>
            <PhotoGrid photos={content.photos} />
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}