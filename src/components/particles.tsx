"use client";

import React, { useRef, useEffect } from "react";
import { useMousePosition } from "@/hooks/use-mouse";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  maxDpr?: number;
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export default function Particles({
  className = "",
  quantity = 80,
  staticity = 50,
  ease = 50,
  maxDpr = 2,
}: ParticlesProps) {
  const pathname = usePathname();
  const disabled =
    pathname.startsWith("/admin") || (pathname.startsWith("/blogs/") && pathname !== "/blogs");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const rafId = useRef(0);

  useEffect(() => {
    if (disabled) return;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const circleParams = (): Circle => ({
      x: Math.floor(Math.random() * canvasSize.current.w),
      y: Math.floor(Math.random() * canvasSize.current.h),
      translateX: 0,
      translateY: 0,
      size: Math.random() * 1.8 + 0.3,
      alpha: 0,
      targetAlpha: Number((Math.random() * 0.55 + 0.12).toFixed(2)),
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      magnetism: 0.1 + Math.random() * 3.5,
    });

    const drawCircle = (c: Circle, update = false) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.translate(c.translateX, c.translateY);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.current.push(c);
    };

    const initCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      ctxRef.current = canvasRef.current.getContext("2d");
      if (!ctxRef.current) return;
      circles.current.length = 0;
      canvasSize.current.w = containerRef.current.offsetWidth;
      canvasSize.current.h = containerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      ctxRef.current.scale(dpr, dpr);
      for (let i = 0; i < quantity; i++) drawCircle(circleParams());
    };

    const animate = () => {
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        circles.current.forEach((c, i) => {
          const edge = Math.min(
            c.x + c.translateX - c.size,
            canvasSize.current.w - c.x - c.translateX - c.size,
            c.y + c.translateY - c.size,
            canvasSize.current.h - c.y - c.translateY - c.size
          );
          const factor = Math.max(0, Math.min(1, edge / 20));
          c.alpha = factor >= 1 ? Math.min(c.targetAlpha, c.alpha + 0.02) : c.targetAlpha * factor;
          c.x += c.dx;
          c.y += c.dy;
          c.translateX += (mouse.current.x / (staticity / c.magnetism) - c.translateX) / ease;
          c.translateY += (mouse.current.y / (staticity / c.magnetism) - c.translateY) / ease;

          if (
            c.x < -c.size ||
            c.x > canvasSize.current.w + c.size ||
            c.y < -c.size ||
            c.y > canvasSize.current.h + c.size
          ) {
            circles.current.splice(i, 1);
            drawCircle(circleParams());
          } else {
            drawCircle(c, true);
          }
        });
      }
      rafId.current = requestAnimationFrame(animate);
    };

    initCanvas();
    animate();

    const onVisibility = () => {
      cancelAnimationFrame(rafId.current);
      if (!document.hidden) animate();
    };

    window.addEventListener("resize", initCanvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", initCanvas);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disabled, quantity, staticity, ease, maxDpr]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { w, h } = canvasSize.current;
    const x = mousePosition.x - rect.left - w / 2;
    const y = mousePosition.y - rect.top - h / 2;
    if (Math.abs(x) < w / 2 && Math.abs(y) < h / 2) {
      mouse.current.x = x;
      mouse.current.y = y;
    }
  }, [mousePosition.x, mousePosition.y]);

  if (disabled) return null;

  return (
    <div
      className={cn(
        className,
        "dark:bg-gradient-to-tl from-black via-zinc-700/20 to-black pointer-events-none"
      )}
      ref={containerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
