"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function EasterEggs({ ownerName }: { ownerName: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const firstWord = ownerName.split(" ")[0]?.toLowerCase() || "fahim";
    const key = firstWord.replace(/[^a-z]/g, "") || "fahim";

    console.log(
      `%c👋 Hey curious developer! You found ${ownerName}'s console.\n%cType %c${key}%c in the console and press Enter for a surprise ✨`,
      "color: #38bdf8; font-size: 14px; font-weight: bold;",
      "color: #94a3b8; font-size: 12px;",
      "color: #fb923c; font-weight: bold; font-size: 13px;",
      "color: #94a3b8; font-size: 12px;"
    );

    if (!Object.prototype.hasOwnProperty.call(window, key)) {
      Object.defineProperty(window, key, {
        configurable: true,
        get() {
          console.log(
            `%c✨ Boom! Thanks for exploring ${ownerName}'s portfolio! Press 'f' anywhere on the page to launch confetti.`,
            "color: #34d399; font-size: 14px; font-weight: bold;"
          );
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          return "🚀 Crafted with Next.js, Three.js & Supabase";
        },
      });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as Element | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key.toLowerCase() === "f" && e.shiftKey) {
        confetti({ particleCount: 55, spread: 70, origin: { y: 0.65 } });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ownerName]);

  return null;
}
