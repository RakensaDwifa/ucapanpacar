"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateShell, Signature, PhotoGrid, TimelineSection } from "./shared";
import type { TemplateRenderProps } from "@/lib/types";

const PLEAD_TEXTS = [
  "Ayolahhh 🥺",
  "Beneran, aku menyesal 😢",
  "Gimana caranya biar kamu maafin? 💔",
  "Kamu tuh yang paling penting buatku 🫶",
  "Aku janji nggak akan ngulangin 🙏",
];

export default function PermintaanMaaf({ content, preview }: TemplateRenderProps) {
  const [opened, setOpened] = useState(Boolean(preview));
  const [forgiven, setForgiven] = useState(Boolean(preview));
  const [attempts, setAttempts] = useState(0);
  const [runawayPos, setRunawayPos] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const initialRunawayPos = useMemo(() => {
    if (!isClient) {
      return { x: 0, y: 0 };
    }
    return {
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 120,
    };
  }, [isClient]);

  const runaway = () => {
    setAttempts((n) => n + 1);
    if (!isClient) return;
    setRunawayPos({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 120,
    });
  };

  return (
    <TemplateShell content={content} className="bg-gradient-to-b from-[#F2F7F2] via-[#E6EFE6] to-[#D4E5D4]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <motion.span
              className="text-7xl mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🥺
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-headline-md font-heading text-on-surface mb-3"
            >
              Halo {content.toName}…
            </motion.p>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-sm">
              Aku punya sesuatu yang penting banget untuk dikatakan. Boleh?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpened(true)}
              className="px-8 py-4 bg-[#5C7A5C] text-white text-label-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(92,122,92,0.35)]"
            >
              Maafkan Aku ya? 🙏
            </motion.button>
          </motion.div>
        ) : forgiven ? (
          <motion.div
            key="forgiven"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border border-outline-variant/30 shadow-card p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-[#E8F0E8] flex items-center justify-center mb-4 mx-auto text-4xl"
            >
              🫂
            </motion.div>
            <p className="font-heading italic text-[#5C7A5C] text-3xl text-center mb-1">
              Makasih sudah memaafkan, {content.toName} 💚
            </p>
            <div className="border-t border-outline-variant/30 pt-6 mt-6">
              <p className="text-body-lg leading-relaxed text-on-surface whitespace-pre-line text-center">
                {content.message}
              </p>
              <Signature fromName={content.fromName} />
            </div>
            <PhotoGrid photos={content.photos} />
            <TimelineSection timeline={content.timeline} />
          </motion.div>
        ) : (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <motion.span className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              💔
            </motion.span>
            <p className="text-headline-md font-heading text-on-surface mb-2">
              Aku minta maaf, {content.toName}
            </p>
            <p className="text-body-md text-on-surface-variant mb-10 max-w-sm">
              {PLEAD_TEXTS[Math.min(attempts, PLEAD_TEXTS.length - 1)]}
            </p>

            <div className="relative w-full max-w-xs h-40">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setForgiven(true)}
                className="px-6 py-3.5 bg-[#5C7A5C] text-white text-label-lg font-semibold rounded-full shadow-md"
              >
                Ya, aku maafkan 💛
              </motion.button>
              <motion.button
                animate={attempts > 0 ? runawayPos : {}}
                transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                onClick={runaway}
                className="absolute top-2 right-2 px-4 py-2 bg-surface-container-low text-on-surface-variant text-label-md font-semibold rounded-full border border-outline-variant/40"
              >
                Belum dulu 😤
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}