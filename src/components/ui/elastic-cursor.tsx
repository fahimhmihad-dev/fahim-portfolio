"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { usePreloader } from "@/components/preloader";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname } from "next/navigation";

const CURSOR_DIAMETER = 46;
const WRAP_PADDING = 8;
const WRAP_RADIUS = 12;
const WRAP_EASE = 0.2;
const TARGET_PULL = 0.3;
const TARGET_EASE = 0.25;
const TARGET_MAX_PULL = 10;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function getScale(diffX: number, diffY: number) {
  return Math.min(Math.hypot(diffX, diffY) / 735, 0.35);
}

function getAngle(diffX: number, diffY: number) {
  return (Math.atan2(diffY, diffX) * 180) / Math.PI;
}

type Base = { left: number; top: number; width: number; height: number; cx: number; cy: number };

export default function ElasticCursor() {
  const pathname = usePathname();
  const isDisabledRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/resume") ||
    (pathname.startsWith("/blogs/") && pathname !== "/blogs");

  const { isLoading } = usePreloader();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const jellyRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [cursorMoved, setCursorMoved] = useState(false);
  const cursorMovedRef = useRef(false);

  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const jelly = useRef({
    x: 0,
    y: 0,
    w: CURSOR_DIAMETER,
    h: CURSOR_DIAMETER,
    r: CURSOR_DIAMETER / 2,
    sx: 1,
    sy: 1,
  });
  const active = useRef<{ el: HTMLElement | null; base: Base | null; offX: number; offY: number }>({
    el: null,
    base: null,
    offX: 0,
    offY: 0,
  });
  const setters = useRef<Record<string, (v: number) => void>>({});

  useLayoutEffect(() => {
    const jellyEl = jellyRef.current;
    const dotEl = dotRef.current;
    if (!jellyEl || !dotEl) return;

    gsap.set(jellyEl, { xPercent: -50, yPercent: -50 });
    gsap.set(dotEl, { xPercent: -50, yPercent: -50 });

    setters.current = {
      x: gsap.quickSetter(jellyEl, "x", "px") as (v: number) => void,
      y: gsap.quickSetter(jellyEl, "y", "px") as (v: number) => void,
      r: gsap.quickSetter(jellyEl, "rotate", "deg") as (v: number) => void,
      sx: gsap.quickSetter(jellyEl, "scaleX") as (v: number) => void,
      sy: gsap.quickSetter(jellyEl, "scaleY") as (v: number) => void,
      width: gsap.quickSetter(jellyEl, "width", "px") as (v: number) => void,
      height: gsap.quickSetter(jellyEl, "height", "px") as (v: number) => void,
      radius: gsap.quickSetter(jellyEl, "borderRadius", "px") as (v: number) => void,
      opacity: gsap.quickSetter(jellyEl, "opacity") as (v: number) => void,
      dotX: gsap.quickSetter(dotEl, "x", "px") as (v: number) => void,
      dotY: gsap.quickSetter(dotEl, "y", "px") as (v: number) => void,
      dotOpacity: gsap.quickSetter(dotEl, "opacity") as (v: number) => void,
    };
  }, [isMobile, isDisabledRoute]);

  const render = useCallback(() => {
    const s = setters.current;
    if (!s.x) return;

    s.dotX(pointer.current.x);
    s.dotY(pointer.current.y);

    const el = active.current.el;
    const b = active.current.base;

    if (el && b) {
      const pullX = clamp((pointer.current.x - b.cx) * TARGET_PULL, -TARGET_MAX_PULL, TARGET_MAX_PULL);
      const pullY = clamp((pointer.current.y - b.cy) * TARGET_PULL, -TARGET_MAX_PULL, TARGET_MAX_PULL);
      active.current.offX = lerp(active.current.offX, pullX, TARGET_EASE);
      active.current.offY = lerp(active.current.offY, pullY, TARGET_EASE);
      gsap.set(el, { x: active.current.offX, y: active.current.offY });

      jelly.current.x = lerp(jelly.current.x, b.cx + active.current.offX, WRAP_EASE);
      jelly.current.y = lerp(jelly.current.y, b.cy + active.current.offY, WRAP_EASE);
      jelly.current.w = lerp(jelly.current.w, b.width + WRAP_PADDING * 2, WRAP_EASE);
      jelly.current.h = lerp(jelly.current.h, b.height + WRAP_PADDING * 2, WRAP_EASE);
      jelly.current.r = lerp(jelly.current.r, WRAP_RADIUS, WRAP_EASE);
      jelly.current.sx = lerp(jelly.current.sx, 1, 0.3);
      jelly.current.sy = lerp(jelly.current.sy, 1, 0.3);

      s.x(jelly.current.x);
      s.y(jelly.current.y);
      s.width(jelly.current.w);
      s.height(jelly.current.h);
      s.radius(jelly.current.r);
      s.sx(jelly.current.sx);
      s.sy(jelly.current.sy);
      s.r(0);
      s.opacity(1);
      s.dotOpacity(0);
    } else {
      const rotation = getAngle(vel.current.x, vel.current.y);
      const scale = getScale(vel.current.x, vel.current.y);
      jelly.current.x = pos.current.x;
      jelly.current.y = pos.current.y;
      jelly.current.w = lerp(jelly.current.w, CURSOR_DIAMETER + scale * 220, 0.4);
      jelly.current.h = lerp(jelly.current.h, CURSOR_DIAMETER, 0.4);
      jelly.current.r = lerp(jelly.current.r, CURSOR_DIAMETER / 2, 0.4);

      s.x(pos.current.x);
      s.y(pos.current.y);
      s.width(jelly.current.w);
      s.height(jelly.current.h);
      s.radius(jelly.current.r);
      s.r(rotation);
      s.sx(1 + scale);
      s.sy(1 - scale * 1.6);
      s.opacity(1);
      s.dotOpacity(1);
    }
  }, []);

  useEffect(() => {
    if (isMobile || isDisabledRoute) return;

    const onMove = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      if (!cursorMovedRef.current) {
        cursorMovedRef.current = true;
        setCursorMoved(true);
      }
      gsap.to(pos.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 1.1,
        ease: "elastic.out(1, 0.55)",
        onUpdate: () => {
          vel.current.x = (e.clientX - pos.current.x) * 1.1;
          vel.current.y = (e.clientY - pos.current.y) * 1.1;
        },
      });
    };

    const release = () => {
      const el = active.current.el;
      if (el) {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "elastic.out(1, 0.38)",
          clearProps: "transform",
        });
      }
      active.current = { el: null, base: null, offX: 0, offY: 0 };
    };

    const onOver = (e: Event) => {
      const target = (e.target as Element | null)?.closest?.(".cursor-can-hover") as HTMLElement | null;
      if (target === active.current.el) return;
      if (active.current.el) release();
      if (target) {
        const r = target.getBoundingClientRect();
        active.current = {
          el: target,
          base: {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
          },
          offX: 0,
          offY: 0,
        };
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("mouseleave", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseleave", release);
      window.removeEventListener("blur", release);
      release();
    };
  }, [isMobile, isDisabledRoute]);

  useEffect(() => {
    const paused = isLoading || !cursorMoved || isMobile || isDisabledRoute;
    if (!paused) gsap.ticker.add(render);
    return () => {
      gsap.ticker.remove(render);
    };
  }, [render, isLoading, cursorMoved, isMobile, isDisabledRoute]);

  if (isMobile || isDisabledRoute) return null;

  return (
    <>
      <div
        ref={jellyRef}
        id="jelly-id"
        className={cn(
          "fixed left-0 top-0 border-2 border-black dark:border-white pointer-events-none will-change-transform"
        )}
        style={{
          width: CURSOR_DIAMETER,
          height: CURSOR_DIAMETER,
          borderRadius: CURSOR_DIAMETER / 2,
          opacity: 0,
          zIndex: 100,
          backdropFilter: "invert(100%)",
        }}
      />
      <div
        ref={dotRef}
        className="w-3 h-3 rounded-full fixed left-0 top-0 pointer-events-none will-change-transform"
        style={{
          opacity: 0,
          backdropFilter: "invert(100%)",
          zIndex: 101,
        }}
      />
    </>
  );
}
