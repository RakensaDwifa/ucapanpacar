"use client";

import { Toaster } from "sonner";

export function ToasterWrapper() {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      toastOptions={{
        className: "bg-white border border-outline-variant shadow-lg",
        style: { fontFamily: "inherit" },
      }}
    />
  );
}