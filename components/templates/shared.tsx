"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Pause, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UcapanContent } from "@/lib/types";

const HEART_EMOJIS = ["❤️", "💖", "💕", "🌹", "✨"];

const HEART_PATTERNS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 10,
  duration: 9 + Math.random() * 8,
  size: 14 + Math.random() * 22,
  emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
}));

function FloatingHearts({ count = 12 }: { count?: number }) {
  const hearts = HEART_PATTERNS.slice(0, count);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute top-full select-none"
          style={{ left: `${h.left}%`, fontSize: h.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-110vh", opacity: [0, 1, 1, 0], rotate: [0, 20, -20, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {h.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function MusicToggle({ content }: { content: UcapanContent }) {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  if (!content.musicUrl) return null;

  const toggle = () => {
    if (!audio) {
      const el = new Audio(content.musicUrl);
      el.loop = true;
      el.play().catch(() => {});
      setAudio(el);
      setPlaying(true);
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Jeda musik" : "Putar musik"}
      className="fixed bottom-6 left-5 z-50 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-md border border-outline-variant/40 text-primary shadow-lg w-12 h-12 hover:scale-105 transition-transform"
    >
      {playing ? <Pause className="h-5 w-5" /> : <Music className="h-5 w-5" />}
    </button>
  );
}

function CloseButton({ href }: { href?: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label="Tutup"
      className="fixed top-5 right-5 z-50 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-md border border-outline-variant/40 text-on-surface-variant shadow-lg w-11 h-11 hover:scale-105 transition-transform"
    >
      <X className="h-5 w-5" />
    </a>
  );
}

interface ShellProps {
  content: UcapanContent;
  children: React.ReactNode;
  className?: string;
  closeHref?: string;
}

export function TemplateShell({ content, children, className, closeHref }: ShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-on-surface",
        className ?? "bg-gradient-to-b from-[#FFF0F3] via-[#FFE3EA] to-[#FFD9E2]"
      )}
    >
      <FloatingHearts />
      <MusicToggle content={content} />
      <CloseButton href={closeHref} />
      <div className="relative z-10 w-full max-w-xl px-5 py-16">{children}</div>
    </div>
  );
}

export function Signature({ fromName }: { fromName: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="text-right font-heading italic text-primary text-2xl mt-8"
    >
      — {fromName}
    </motion.p>
  );
}

export function PhotoGrid({ photos }: { photos: string[] }) {
  const items =
    photos.length > 0
      ? photos.map((src, i) => ({ src, key: i }))
      : [
          { src: null, key: 0 },
          { src: null, key: 1 },
        ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {items.map((p, i) => (
        <motion.div
          key={p.key}
          initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -3 : 3 }}
          animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -2 : 2 }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
          className="bg-white p-2.5 pb-4 rounded-lg shadow-card border border-outline-variant/30"
        >
          {p.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.src}
              alt={`Kenangan ${i + 1}`}
              className="w-full h-36 object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-36 rounded-md bg-gradient-to-br from-[#FFD9E2] to-[#F5A8BF] flex items-center justify-center text-4xl">
              💞
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function OpenButton({ onClick, label = "Buka" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="px-8 py-4 bg-primary text-white text-label-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(217,108,138,0.35)]"
    >
      {label}
    </motion.button>
  );
}

export function TimelineSection({ timeline }: { timeline?: { date: string; title: string; description?: string }[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-outline-variant/30">
      <h3 className="font-heading text-title-lg text-primary text-center mb-6">
        ✨ Perjalanan Cinta Kita ✨
      </h3>
      <div className="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-6">
        {timeline.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
            <span className="inline-block px-3 py-1 bg-primary-fixed/40 text-primary rounded-full text-label-md font-semibold mb-1">
              {item.date}
            </span>
            <h4 className="font-heading text-title-md text-on-surface">{item.title}</h4>
            {item.description && (
              <p className="text-body-md text-on-surface-variant mt-1">{item.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
