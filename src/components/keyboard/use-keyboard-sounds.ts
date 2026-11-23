"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Pure Web Audio API tactile mechanical switch sound synthesizer.
 * Produces a subtle, realistic "thock" on key down and crisp "clack" on key up
 * without loading any external audio files.
 */
export function useKeyboardSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current && typeof window !== "undefined" && window.AudioContext) {
        ctxRef.current = new window.AudioContext();
      }
      if (ctxRef.current?.state === "suspended") {
        void ctxRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true, capture: true });
    window.addEventListener("keydown", unlock, { passive: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      if (ctxRef.current) {
        void ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  return useCallback((pressed: boolean) => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;

    // 1. Short tonal body ("thock" on down, higher "upstroke" on release)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pressed ? 175 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(pressed ? 62 : 115, now + 0.045);

    oscGain.gain.setValueAtTime(pressed ? 0.14 : 0.07, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(oscGain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);

    // 2. Bandpass-filtered micro click burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.018);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = pressed ? 1600 : 2400;
    filter.Q.value = 1.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(pressed ? 0.12 : 0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }, []);
}
