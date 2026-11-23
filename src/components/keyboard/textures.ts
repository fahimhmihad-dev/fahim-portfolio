"use client";

import * as THREE from "three";

/**
 * Generates a high-DPI CanvasTexture for a keycap top face.
 * Always draws an immediate monogram fallback and upgrades cleanly once the
 * skill's icon image finishes loading with CORS support.
 */
export function createKeycapIconTexture(
  label: string,
  iconUrl: string,
  keyColor: string
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const isLightKey = getLuminance(keyColor) > 0.62;
  const inkColor = isLightKey ? "#0f172a" : "#ffffff";

  const drawFallbackMonogram = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    const abbr = label
      .replace(/[^a-zA-Z0-9+#.\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || label.slice(0, 2).toUpperCase();

    ctx.fillStyle = inkColor;
    ctx.font = `700 ${abbr.length >= 3 ? 72 : 88}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(abbr, size / 2, size / 2 + 4);
    texture.needsUpdate = true;
  };

  drawFallbackMonogram();

  if (iconUrl && typeof window !== "undefined") {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      // Subtle translucent disc behind dark icons on dark keys for legibility
      const pad = 44;
      const maxDim = size - pad * 2;
      const ratio = Math.min(maxDim / (img.naturalWidth || 1), maxDim / (img.naturalHeight || 1));
      const w = (img.naturalWidth || maxDim) * ratio;
      const h = (img.naturalHeight || maxDim) * ratio;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      texture.needsUpdate = true;
    };
    img.onerror = () => {
      // Keep crisp monogram fallback
    };
    img.src = iconUrl;
  }

  return texture;
}

function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
