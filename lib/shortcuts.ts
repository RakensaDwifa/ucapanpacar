"use client";

import { useEffect, useRef } from "react";

export type ShortcutHandler = (e: KeyboardEvent) => void;

/** Normalisasi event keyboard jadi string shortcut, cth: "ctrl+shift+z", "escape". */
function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  const key = e.key.toLowerCase();
  // Hindari dobel saat key itu sendiri adalah modifier
  if (!["control", "meta", "shift", "alt"].includes(key)) {
    parts.push(key === " " ? "space" : key);
  }
  return parts.join("+");
}

/**
 * Daftarkan keyboard shortcuts global.
 * Handler tidak dijalankan saat fokus berada di input/textarea/contenteditable
 * KECUALI shortcut mengandung modifier (ctrl/alt) — agar Ctrl+S dsb tetap jalan saat mengetik.
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutHandler>,
  enabled = true
) {
  const handlersRef = useRef(shortcuts);
  handlersRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const combo = eventToCombo(e);
      const fn = handlersRef.current[combo];
      if (!fn) return;

      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Jangan intercept tombol polos saat sedang mengetik
      if (isTyping && !hasModifier) return;

      e.preventDefault();
      fn(e);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}
