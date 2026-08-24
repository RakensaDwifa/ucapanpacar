"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Ctrl + S", action: "Simpan & lanjut ke pembayaran" },
  { keys: "Ctrl + Z", action: "Undo (batalkan perubahan)" },
  { keys: "Ctrl + Shift + Z", action: "Redo (ulangi perubahan)" },
  { keys: "Ctrl + Enter", action: "Lanjut ke langkah berikutnya" },
  { keys: "Escape", action: "Kembali ke langkah sebelumnya" },
  { keys: "Alt + 1…4", action: "Lompat ke langkah tertentu" },
];

export default function ShortcutsHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-7 w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-title-lg text-on-surface">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-3">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.keys}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-body-md text-on-surface-variant">
                    {s.action}
                  </span>
                  <kbd className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40 text-label-md font-semibold text-on-surface">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
            <p className="text-label-md text-on-surface-variant mt-6">
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-surface-container-low border border-outline-variant/40">?</kbd>{" "}
              kapan saja untuk membuka panel ini.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
