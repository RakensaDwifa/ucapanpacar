"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseContentHistoryReturn<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  /** Panggil saat content di-set secara programatik (restore draft / load edit) agar tidak masuk history. */
  markRestored: () => void;
}

/**
 * Melacak perubahan `current` dan menyediakan undo/redo.
 * - Perubahan dalam window `coalesceMs` digabung jadi satu step (typing batch).
 * - `apply` dipakai untuk men-set state dari luar (undo/redo) tanpa masuk history lagi.
 */
export function useContentHistory<T>(
  current: T,
  apply: (next: T) => void,
  coalesceMs = 600,
  maxSteps = 50
): UseContentHistoryReturn<T> {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const prev = useRef<T>(current);
  const lastPushAt = useRef(0);
  const skipNext = useRef(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (Object.is(prev.current, current)) return;

    if (skipNext.current) {
      skipNext.current = false;
      prev.current = current;
      forceRender((v) => v + 1);
      return;
    }

    const now = Date.now();
    if (now - lastPushAt.current > coalesceMs) {
      past.current.push(prev.current);
      if (past.current.length > maxSteps) past.current.shift();
      future.current = [];
      lastPushAt.current = now;
    } else {
      // Masih dalam window coalesce — refresh timestamp agar rantai typing
      // berikutnya tetap tergabung sampai user berhenti.
      lastPushAt.current = now;
    }
    prev.current = current;
    forceRender((v) => v + 1);
  }, [current, coalesceMs, maxSteps]);

  const undo = useCallback(() => {
    const entry = past.current.pop();
    if (entry === undefined) return;
    future.current.push(prev.current);
    lastPushAt.current = 0;
    skipNext.current = true;
    apply(entry);
  }, [apply]);

  const redo = useCallback(() => {
    const entry = future.current.pop();
    if (entry === undefined) return;
    past.current.push(prev.current);
    lastPushAt.current = 0;
    skipNext.current = true;
    apply(entry);
  }, [apply]);

  const markRestored = useCallback(() => {
    skipNext.current = true;
    past.current = [];
    future.current = [];
    lastPushAt.current = 0;
    forceRender((v) => v + 1);
  }, []);

  return {
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    undo,
    redo,
    markRestored,
  };
}
